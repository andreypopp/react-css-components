/**
 * @copyright 2016-present, React CSS Components team
 * @flow
 */

import * as types from 'babel-types';
import {identifier, stringLiteral} from 'babel-types';
import * as postcss from 'postcss';
import * as LoaderUtils from 'loader-utils';
import generate from 'babel-generator';
import transformVariants from './transformVariants';
import HTMLTagList from './HTMLTagList';
import * as ComponentRef from './ComponentRef';
import * as Syntax from './Syntax';

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
  let imports = stmt`
      import React from "react";
      import styles from "${stringLiteral(config.requestCSS)}";
  `;
  let statements = [];
  let component = stringLiteral('div');
  root.walkRules(node => {
    if (!Syntax.isComponent(node)) {
      return;
    }
    node.walkDecls(decl => {
      if (decl.prop === 'base') {
        if (HTMLTagList[decl.value]) {
          component = stringLiteral(decl.value);
        } else {
          component = identifier(node.selector + '__Base');
          let ref = ComponentRef.parse(decl.value);
          imports.push(stmt`
            import {
              ${identifier(ref.name)} as ${component}
            } from "${stringLiteral(ref.source)}";
          `);
        }
      }
    });
    statements.push(stmt`
      export function ${identifier(node.selector)}(props) {
        return React.createElement(
          ${component},
          {...props, className: styles.${identifier(node.selector)}}
        );
      }
    `);
  });
  return generate(types.program(imports.concat(statements))).code;
}
