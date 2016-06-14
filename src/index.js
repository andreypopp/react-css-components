/**
 * @copyright 2016-present, React CSS Components team
 * @flow
 */

import {createHash} from 'crypto';
import invariant from 'invariant';
import * as LoaderUtils from 'loader-utils';

import {identifier, stringLiteral, program} from 'babel-types';
import generate from 'babel-generator';
import traverse from 'babel-traverse';
import * as types from 'babel-types';
import {expr, stmt} from 'babel-plugin-ast-literal/api';
import {parse} from 'babylon';

import * as postcss from 'postcss';
import createSelectorParser, {className} from 'postcss-selector-parser';

import HTMLTagList from './HTMLTagList';
import CSSPseudoClassList from './CSSPseudoClassList';
import * as ComponentRef from './ComponentRef';


type RenderConfig = {
  requestCSS: string;
};

type JSNode = Object;
type CSSNode = Object;

type VariantSpec = {
  componentName: string;
  variantName: string;
  expression: ?JSNode;
};

type ComponentSpec = {
  base: ?JSNode;
  variants: {[name: string]: {expression: ?JSNode}};
};

type ComponentSpecCollection = {
  [name: string]: ComponentSpec;
};

const LOADER = require.resolve('../webpack');

const OBJECT_ASSIGN = require.resolve('object-assign');

const COMPONENT_RE = /^[A-Z][a-zA-Z_0-9]*$/;

const PROP_VARIANT_NAME = ':prop';

function hash(value) {
  let hasher = createHash('md5');
  hasher.update(value);
  return hasher.digest('hex');
}

function parseSelector(selector) {
  let parser = createSelectorParser();
  return parser.process(selector).res;
}

function isPropReference(path) {
  if (!types.isIdentifier(path.node)) {
    return false;
  }
  if (path.node.__seen) {
    return false;
  }
  if (path.scope.parent !== undefined) {
    return false;
  }
  if (types.isMemberExpression(path.parentPath.node)) {
    while (types.isMemberExpression(path.parentPath.node)) {
      if (path.node === path.parentPath.node.property) {
        return false;
      }
      path = path.parentPath;
    }
  }
  return true;
}

function parsePropVariantExpression(expression) {
  let node = parse(expression);
  traverse(node, {
    enter(path) {
      if (isPropReference(path)) {
        let nextNode = expr`props.${path.node}`;
        nextNode.object.__seen = true;
        path.replaceWith(nextNode);
      }
    }
  });
  node = node.program.body[0].expression;
  return node;
}

function findComponentNames(node: CSSNode): Array<string> {
  let componentNames = [];
  let selector = parseSelector(node.selector);
  selector.eachTag(selector => {
    if (COMPONENT_RE.exec(selector.value)) {
      componentNames.push(selector.value);
    }
  });
  return componentNames;
}

function findVariants(node: CSSNode): Array<VariantSpec> {
  let variantNames = [];
  let selector = parseSelector(node.selector);
  selector.eachPseudo(selector => {
    let expression = null;
    let variantName = selector.value.slice(1);

    if (selector.value === PROP_VARIANT_NAME) {
      expression = node.selector.slice(
        selector.source.start.column + PROP_VARIANT_NAME.length,
        selector.source.end.column - 1
      );
      variantName = variantName + '__' + hash(expression).slice(0, 6);
      expression = parsePropVariantExpression(expression);
    }

    let idx = selector.parent.nodes.indexOf(selector);
    let prev = selector.parent.nodes[idx - 1];
    if (prev && prev.type === 'tag' && COMPONENT_RE.exec(prev.value)) {
      variantNames.push({
        componentName: prev.value,
        variantName,
        expression,
      });
    }
  });
  return variantNames;
}

function isPrimaryComponent(node: CSSNode): boolean {
  let selector = parseSelector(node.selector);
  return (
    selector.nodes.length === 1 &&
    selector.nodes[0].type === 'selector' &&
    selector.nodes[0].nodes.length === 1 &&
    selector.nodes[0].nodes[0].type === 'tag' &&
    COMPONENT_RE.exec(selector.nodes[0].nodes[0].value)
  );
}

function renderToCSS(source: string): string {
  let root = postcss.parse(source);
  root.walkRules(node => {
    removeBaseDeclaration(node);
    localizeComponentRule(node);
  });
  return root.toString();
}

function removeBaseDeclaration(node) {
  node.walkDecls(node => {
    if (node.prop === 'base') {
      node.remove();
    }
  });
}

function localizeComponentRule(node) {
  let componentNames = findComponentNames(node);
  if (componentNames.length > 0) {
    let toClassify = [];
    let toPseudoClassify = [];
    let selector = parseSelector(node.selector);
    selector.eachTag(selector => {
      if (componentNames.indexOf(selector.value) > -1) {
        toClassify.push(selector);
      }
    });
    selector.eachPseudo(selector => {
      let idx = selector.parent.nodes.indexOf(selector);
      let prev = selector.parent.nodes[idx - 1];
      if (prev && prev.type === 'tag' && componentNames.indexOf(prev.value) > -1) {
        let componentName = prev.value;
        let variantName = selector.value.slice(1);
        if (CSSPseudoClassList[variantName]) {
          selector.parent.parent.append(className({value: componentName + '__' + variantName}));
        } else {
          toPseudoClassify.push(selector);
        }
      }
    });
    toPseudoClassify.forEach(selector => {
      let parent = selector.parent;
      let idx = parent.nodes.indexOf(selector);
      let prev = parent.nodes[idx - 1];
      let componentName = prev.value;
      let variantName = selector.value.slice(1);
      if (selector.value === PROP_VARIANT_NAME) {
        let expression = node.selector.slice(
          selector.source.start.column + PROP_VARIANT_NAME.length,
          selector.source.end.column - 1
        );
        variantName = variantName + '__' + hash(expression).slice(0, 6);
      }
      let nextSelector = className({value: componentName + '__' + variantName});
      prev.removeSelf();
      selector.replaceWith(nextSelector);
    });
    toClassify.forEach(selector => {
      let nextSelector = className({value: selector.value});
      selector.replaceWith(nextSelector);
    });
    let nextNode = node.clone();
    nextNode.selector = selector.toString();
    node.replaceWith(nextNode);
  }
}

function renderToJS(source: string, config: RenderConfig): string {
  let root = postcss.parse(source);

  let imports = stmt`
    var React = require("react");
    var objectAssign = require("${OBJECT_ASSIGN}");
    var styles = require("${config.requestCSS}");
  `;
  let statements = [];
  let components: ComponentSpecCollection = {};

  function registerComponent(componentName) {
    if (components[componentName] === undefined) {
      components[componentName] = {
        base: stringLiteral('div'),
        variants: {},
      };
    }
  }

  function registerComponentVariants({componentName, variantName, expression}) {
    invariant(
      components[componentName],
      'Trying to configure base for an unknown component %s', componentName
    );
    components[componentName].variants[variantName] = {expression};
  }

  function configureComponentBase(componentName, base) {
    invariant(
      components[componentName],
      'Trying to configure base for an unknown component %s', componentName
    );

    if (HTMLTagList[base]) {
      base = stringLiteral(base);
    } else {
      let ref = ComponentRef.parse(base);
      invariant(
        ref != null,
        'Found invalid component ref: %s', base
      );
      base = identifier(componentName + '__Base');
      imports.push(stmt`
        var ${base} = require("${ref.source}").${identifier(ref.name)};
      `);
    }

    components[componentName].base = base;
  }

  // walk CSS AST and register all component configurations
  root.walkRules(node => {
    let componentNames = findComponentNames(node);
    if (componentNames.length === 0) {
      return;
    }

    componentNames.forEach(componentName => {
      registerComponent(componentName);
    });

    if (isPrimaryComponent(node)) {
      let componentName = componentNames[0];
      node.walkDecls(decl => {
        if (decl.prop === 'base') {
          configureComponentBase(componentName, decl.value);
        }
      });
    }

    let variants = findVariants(node);
    for (let i = 0; i < variants.length; i++) {
      let variant = variants[i];
      registerComponentVariants(variant);
    }
  });

  // generate JS code from component configurations
  for (let componentName in components) {
    let component = components[componentName];
    if (components.hasOwnProperty(componentName)) {
      let className = expr`styles.${identifier(componentName)}`;
      for (let variantName in component.variants) {
        let variant = component.variants[variantName];
        if (variant.expression) {
          className = expr`
            ${className} + (${variant.expression}
                            ? ' ' + styles.${identifier(componentName + '__' + variantName)}
                            : '')
          `;
        } else {
          className = expr`
            ${className} + (variant.${identifier(variantName)}
                            ? ' ' + styles.${identifier(componentName + '__' + variantName)}
                            : '')
          `;
        }
      }
      statements.push(stmt`
        module.exports.${identifier(componentName)} = function ${identifier(componentName)}(props) {
          var variant = props.variant || {};
          var className = ${className};
          return React.createElement(
            ${component.base},
            objectAssign({}, props, {className: className, variant: undefined})
          );
        }
      `);
    }
  }

  return generate(program(imports.concat(statements))).code;
}

/**
 * Webpack loader for React CSS component modules.
 */
export function loader(source: string): string {
  this.cacheable();
  let query = LoaderUtils.parseQuery(this.query);
  if (query.css) {
    let result = renderToCSS(source);
    return result;
  } else {
    let loadCSS = query.loadCSS
      ? query.loadCSS
      : ['style-loader', 'css-loader?modules'];
    let requestCSS = `!!${loadCSS.join('!')}!${LOADER}?css!${this.resource}`;
    let result = renderToJS(source, {requestCSS});
    return result;
  }
}

/**
 * Render React CSS component module into JS and CSS sources.
 */
export function render(source: string, config: RenderConfig): {js: string; css: string} {
  let js = renderToJS(source, {requestCSS: config.requestCSS});
  let css = renderToCSS(source);
  return {js, css};
}
