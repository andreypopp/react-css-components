/**
 * @copyright 2016-present, React CSS Components team
 * @flow
 */

/**
 * Variant names we want to see compiled as CSS pseudo classes.
 */
const _SUPPORTED_PSEUDO_CLASSES = {
  focus: true,
  hover: true,
  active: true,
  checked: true,
  default: true,
  disabled: true,
  empty: true,
  enabled: true,
  firstChild: true,
  fullscreen: true,
  indeterminate: true,
  invalid: true,
  lastChild: true,
  left: true,
  link: true,
  onlyChild: true,
  optional: true,
  required: true,
  right: true,
  root: true,
  scope: true,
  target: true,
  valid: true,
  visited: true,
};

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
