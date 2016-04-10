/**
 * @copyright 2016-present, React CSS Components team
 * @flow
 */

const COMPONENT_RE = /^[a-zA-Z_0-9]+$/;

export function isComponent(node) {
  return (
    node.type === 'rule' &&
    COMPONENT_RE.exec(node.selector) &&
    node.parent &&
    node.parent.type === 'root'
  );
}
