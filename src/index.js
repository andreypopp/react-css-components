/**
 * @copyright 2016-present, React CSS Components team
 * @flow
 */

import * as types from 'babel-types';
import * as postcss from 'postcss';
import * as LoaderUtils from 'loader-utils';
import generate from 'babel-generator';
import transformVariants, {isVariant} from './transformVariants';
import HTMLTagList from './HTMLTagList';
import * as ComponentRef from './ComponentRef';

const LOADER = require.resolve('../webpack');

export type RenderConfig = {
  requestCSS: string;
};

export function loader(source: string): string {
  this.cacheable();
  let query = LoaderUtils.parseQuery(this.query);
  if (query.css) {
    let result = renderToCSS(source);
    return result;
  } else {
    let requestCSS = `!!style-loader!css-loader?module!${LOADER}?css!${this.resource}`;
    let result = renderToJS(source, {requestCSS});
    return result;
  }
}

export function render(source: string, config: RenderConfig = {}): {js: string; css: string}{
  let js = renderToJS(source, {requestCSS: config.requestCSS});
  let css = renderToCSS(source);
  return {js, css};
}

function renderToCSS(source: string, _config: RenderConfig): string {
  let root = postcss.parse(source);
  root = transformVariants(root);
  root.walkRules(node => {
    node.walkDecls(decl => {
      if (decl.prop === 'base') {
        decl.remove();
      }
    });
    let cssNode = node.clone();
    cssNode.selector = `:local(.${node.selector})`;
    node.replaceWith(cssNode);
  });
  return root.toString();
}

function renderToJS(source: string, config: RenderConfig): string {
  let root = postcss.parse(source);
  let statements = [];
  let component = types.stringLiteral('div');
  root.walkRules(node => {
    if (isVariant(node)) {
      return;
    }
    node.walkDecls(decl => {
      if (decl.prop === 'base') {
        if (HTMLTagList[decl.value]) {
          component = types.stringLiteral(decl.value);
        } else {
          component = types.identifier(node.selector + '__Base');
          statements.unshift(
            ComponentRef.importDeclaration(component, decl.value)
          );
        }
      }
    });
    statements.push(exportComponent(node.selector, component, node.selector));
  });
  statements.unshift(
    types.importDeclaration(
      [types.importDefaultSpecifier(types.identifier('styles'))],
      types.stringLiteral(config.requestCSS)
    )
  );
  statements.unshift(
    types.importDeclaration(
      [types.importDefaultSpecifier(types.identifier('React'))],
      types.stringLiteral('react')
    )
  );
  return generate(types.program(statements)).code;
}

function exportComponent(name: string, component: string, className: string) {
  let propsNode = types.objectExpression([
    types.spreadProperty(types.identifier('props')),
    types.objectProperty(
      types.identifier('className'),
      types.memberExpression(types.identifier('styles'), types.identifier(className))
    )
  ]);
  let elementNode = types.callExpression(
    types.memberExpression(
      types.identifier('React'),
      types.identifier('createElement')),
    [component, propsNode]
  );
  let componentNode = types.functionDeclaration(
    types.identifier(name),
    [types.identifier('props')],
    types.blockStatement([types.returnStatement(elementNode)])
  );
  return types.exportNamedDeclaration(componentNode, [], null);
}
