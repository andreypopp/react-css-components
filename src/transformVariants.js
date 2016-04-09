/**
 * @copyright 2016-present, React CSS Components team
 * @flow
 */

export default function transformVariants(root) {
  let toAppend = [];
  root.each(rule => {
    if (isComponent(rule)) {
      toAppend = toAppend.concat(flattenVariants(rule));
    }
  });
  root.append(...toAppend);
  return root;
}

function flattenVariants(rule) {
  let toRemove = [];
  let toAppend = [];
  rule.each(variant => {
    if (!isVariant(variant)) {
      return;
    }
    toRemove.push(variant);
    variant = variant.clone();
    variant.selector = rule.selector + variant.selector;
    toAppend = toAppend.concat(variant, ...flattenVariants(variant));
  });
  toRemove.forEach(variant => variant.remove());
  return toAppend;
}

export function isVariant(node) {
  return (
    node.type === 'rule' &&
    node.selector.charAt(0) === ':'
  );
}

export function isComponent(node) {
  return (
    node.type === 'rule' &&
    node.selector.charAt(0) !== ':' &&
    node.parent &&
    node.parent.type === 'root'
  );
}

function findComponent(node) {
  while (true) {
    if (isComponent(node)) {
      return node;
    }
    if (!node.parent) {
      break;
    }
    node = node.parent;
  }
  return null;
}
