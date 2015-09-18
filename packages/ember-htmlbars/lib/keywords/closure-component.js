/**
@module ember
@submodule ember-templates
*/

import { symbol } from 'ember-metal/utils';
import BasicStream from 'ember-metal/streams/stream';
import { read } from 'ember-metal/streams/utils';
import { labelForSubexpr } from 'ember-htmlbars/hooks/subexpr';
import assign from 'ember-metal/assign';
import { processPositionalParams } from 'ember-htmlbars/utils/extract-positional-params';
import lookupComponent from 'ember-htmlbars/utils/lookup-component';

export const COMPONENT_REFERENCE = symbol('COMPONENT_REFERENCE');
export const COMPONENT_CELL = symbol('COMPONENT_CELL');
export const COMPONENT_PATH = symbol('COMPONENT_PATH');
export const COMPONENT_POSITIONAL_PARAMS = symbol('COMPONENT_POSITIONAL_PARAMS');
export const COMPONENT_HASH = symbol('COMPONENT_HASH');

let ClosureComponentStream = BasicStream.extend({
  init(env, path, params, hash) {
    this._env = env;
    this._path = path;
    this._params = params;
    this._hash = hash;
    this.label = labelForSubexpr([path, ...params], hash, 'component');
    this[COMPONENT_REFERENCE] = true;
  },
  compute() {
    return createClosureComponentCell(this._env, this._path, this._params, this._hash);
  }
});

export default function closureComponent(env, [path, ...params], hash) {
  let s = new ClosureComponentStream(env, path, params, hash);

  s.addDependency(path);

  // FIXME: If the stream invalidates on every params or hash change, then
  // the {{component helper will be forces to rerender the whole component
  // each time. Instead, these dependencies should not be required and the
  // element component keyword should add the params and hash as dependencies
  params.forEach(item => s.addDependency(item));
  Object.keys(hash).forEach(key => s.addDependency(hash[key]));

  return s;
}

function createClosureComponentCell(env, originalComponentPath, params, hash) {
  let componentPath = read(originalComponentPath);
  let val;

  if (componentPath && componentPath[COMPONENT_CELL]) {
    let positionalParams = componentPath[COMPONENT_POSITIONAL_PARAMS];
    processPositionalParams(null, positionalParams, params, hash);

    val = {
      [COMPONENT_PATH]: componentPath[COMPONENT_PATH],
      [COMPONENT_HASH]: mergeHash(componentPath[COMPONENT_HASH], hash),
      [COMPONENT_POSITIONAL_PARAMS]: positionalParams,
      [COMPONENT_CELL]: true
    };
  } else {
    let positionalParams = getPositionalParams(env.container, componentPath);
    if (positionalParams) {
      processPositionalParams(null, positionalParams, params, hash);
    }
    val = {
      [COMPONENT_PATH]: componentPath,
      [COMPONENT_HASH]: hash,
      [COMPONENT_POSITIONAL_PARAMS]: positionalParams,
      [COMPONENT_CELL]: true
    };
  }

  return val;
}

function getPositionalParams(container, componentPath) {
  if (!componentPath) { return []; }
  let result = lookupComponent(container, componentPath);
  let component = result.component;

  if (component && component.positionalParams) {
    return component.positionalParams;
  } else {
    return [];
  }
}

export function mergeParams(original, update) {
  // If update has the same or more items than original, we can just return the
  // update
  if (update.length >= original.length) {
    return update;
  } else {
    let result = update.slice(0);
    result.push(...original.slice(update.length));
    return result;
  }
}

export function mergeHash(original, updates) {
  return assign(original, updates);
}
