/**
 * @copyright 2016-present, React CSS Components team
 * @flow
 */

import invariant from 'invariant';
import * as LoaderUtils from 'loader-utils';

import {identifier, stringLiteral, program} from 'babel-types';
import generate from 'babel-generator';

import * as postcss from 'postcss';
import createSelectorParser from 'postcss-selector-parser';

import HTMLTagList from './HTMLTagList';
import * as ComponentRef from './ComponentRef';

type RenderConfig = {
  requestCSS: string;
};

type JSNode = Object;
type CSSNode = Object;

type ComponentSpec = {
  base: ?JSNode;
};

type ComponentSpecCollection = {
  [name: string]: ComponentSpec;
};

const LOADER = require.resolve('../webpack');

const COMPONENT_RE = /^[a-zA-Z_0-9]+$/;

const selectorParser = createSelectorParser();

function findComponentNames(node: CSSNode): Array<string> {
  let componentNames = [];
  selectorParser.process(node.selector).res.eachTag(selector => {
    if (COMPONENT_RE.exec(selector.value)) {
      componentNames.push(selector.value);
    }
  });
  return componentNames;
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
    let selector = selectorParser.process(node.selector).res;
    selector.eachTag(selector => {
      if (componentNames.indexOf(selector.value) > -1) {
        selector.replaceWith(createSelectorParser.className({value: selector.value}));
      }
    });
    let nextNode = node.clone();
    nextNode.selector = selector.toString();
    node.replaceWith(nextNode);
  }
}

function renderToJS(source: string, config: RenderConfig): string {
  let root = postcss.parse(source);

  let imports = stmt`
    import React from "react";
    import styles from "${stringLiteral(config.requestCSS)}";
  `;
  let statements = [];
  let components: ComponentSpecCollection = {};

  function registerComponent(componentName) {
    if (components[componentName] === undefined) {
      components[componentName] = {base: stringLiteral('div')};
    }
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
        import {
          ${identifier(ref.name)} as ${base}
        } from "${stringLiteral(ref.source)}";
      `);
    }

    components[componentName].base = base;
  }

  root.walkRules(node => {
    let componentNames = findComponentNames(node);
    if (componentNames.length === 0) {
      return;
    }
    componentNames.forEach(componentName => {
      registerComponent(componentName);
    });
    if (componentNames.length === 1) {
      let componentName = componentNames[0]
      node.walkDecls(decl => {
        if (decl.prop === 'base') {
          configureComponentBase(componentName, decl.value);
        }
      });
    }
  });

  for (let componentName in components) {
    let component = components[componentName];
    if (components.hasOwnProperty(componentName)) {
      statements.push(stmt`
        export function ${identifier(componentName)}(props) {
          return React.createElement(
            ${component.base},
            {...props, className: styles.${identifier(componentName)}}
          );
        }
      `);
    }
  }

  return generate(program(imports.concat(statements))).code;
}

export function loader(source: string): string {
  this.cacheable();
  let query = LoaderUtils.parseQuery(this.query);
  if (query.css) {
    let result = renderToCSS(source);
    return result;
  } else {
    let requestCSS = `!!style-loader!css-loader?modules!${LOADER}?css!${this.resource}`;
    let result = renderToJS(source, {requestCSS});
    return result;
  }
}

export function render(source: string, config: RenderConfig): {js: string; css: string} {
  let js = renderToJS(source, {requestCSS: config.requestCSS});
  let css = renderToCSS(source);
  return {js, css};
}
