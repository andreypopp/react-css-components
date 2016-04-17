/**
 * @copyright 2016-present, Reactdown Team
 * @flow
 */

// TODO: More robust regexpes required!
const PARSE_REF_RE = /^([a-zA-Z0-9\._\-\/]+)(\?([a-zA-Z0-9_]+))?$/;
const PARSE_NAMED_REF_RE = /^([a-zA-Z0-9_]+)=([a-zA-Z0-9_\.\-\/]+)(\?([a-zA-Z0-9_]+))?$/;

export type ComponentRef = {
  source: string;
  name: string;
};

export function parse(ref: string): ?ComponentRef {
  let match = PARSE_REF_RE.exec(ref);
  if (!match) {
    return null;
  }
  let [_everything, source, _nothing, name = 'default'] = match;
  return {source, name};
}

export function parseNamed(ref: string): ?{id: string; ref: ComponentRef} {
  let match = PARSE_NAMED_REF_RE.exec(ref);
  if (!match) {
    return null;
  }
  let [_everything, id, source, _nothing, name = 'default'] = match;
  return {id, ref: {source, name}};
}
