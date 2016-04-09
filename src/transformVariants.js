/**
 * @copyright 2016-present, React CSS Components team
 * @flow
 */

export default function transformVariants(root) {
  let rules = [];
  root.walkRules(rule => {
    if (!isVariant(rule)) {
      return;
    }
    let component = findComponent(rule);
    rule = rule.remove().clone();
    rule.selector = component.selector + rule.selector;
    rules.push(rule);
  });
  root.append(...rules);
  return root;
}

export function isVariant(node) {
  return (
    node.type === 'rule' &&
    node.selector.charAt(0) === ':'
  );
}

function findComponent(node) {
  while (true) {
    if (node.type === 'rule' && !isVariant(node)) {
      return node;
    }
    if (!node.parent) {
      break;
    }
    node = node.parent;
  }
  return null;
}
