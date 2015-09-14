/**
@module ember
@submodule ember-templates
*/

import { symbol } from 'ember-metal/utils';
import BasicStream from 'ember-metal/streams/stream';
import { read } from 'ember-metal/streams/utils';
import { labelForSubexpr } from 'ember-htmlbars/hooks/subexpr';

export const COMPONENT_REFERENCE = symbol('COMPONENT_REFERENCE');
export const COMPONENT_CELL = symbol('COMPONENT_CELL');
export const COMPONENT_PATH = symbol('COMPONENT_PATH');
export const COMPONENT_PARAMS = symbol('COMPONENT_PARAMS');
export const COMPONENT_POSITIONAL_PARAMS = symbol('COMPONENT_POSITIONAL_PARAMS');
export const COMPONENT_HASH = symbol('COMPONENT_HASH');

let ClosureComponentStream = BasicStream.extend({
  init(path, params, hash) {
    this._path = path;
    this._params = params;
    this._hash = hash;
    this.label = labelForSubexpr([path, ...params], hash, 'component');
    this[COMPONENT_REFERENCE] = true;
  },
  compute() {
    return createClosureComponentCell(this._path, this._params, this._hash);
  }
});

export default function closureComponent([path, ...params], hash) {
  let s = new ClosureComponentStream(path, params, hash);

  s.addDependency(path);

  // FIXME: If the stream invalidates on every params or hash change, then
  // the {{component helper will be forces to rerender the whole component
  // each time. Instead, these dependencies should not be required and the
  // element component keyword should add the params and hash as dependencies
  params.forEach(item => s.addDependency(item));
  Object.keys(hash).forEach(key => s.addDependency(hash[key]));

  return s;
}

function createClosureComponentCell(originalComponentPath, params, hash) {
  let componentPath = read(originalComponentPath);
  let val;

  if (componentPath && componentPath[COMPONENT_CELL]) {
    val = {
      [COMPONENT_PATH]: componentPath[COMPONENT_PATH],
      [COMPONENT_PARAMS]: []
    };
  } else {
    val = {
      [COMPONENT_PATH]: componentPath,
      [COMPONENT_PARAMS]: params,
      [COMPONENT_HASH]: hash,
      [COMPONENT_CELL]: true
    };
  }

  return val;
}
