/**
@module ember
@submodule ember-templates
*/

import { symbol } from 'ember-metals/utils';
import Stream from 'ember-metal/streams/stream';
import { isStream, read, readArray, readHash } from 'ember-metal/streams/utils';

export let COMPONENT_REFERENCE = symbol('COMPONENT_REFERENCE');

export let COMPONENT_CELL = symbol('COMPONENT_CELL');

let ComponentStream = Stream.extend({
  init(componentPath, params, hash) {
    this.componentPath = componentPath;
    this.params = params;
    this.hash = hash;

    if (isStream(componentPath)) {
      this.label = `(component ${componentPath.label})`;
    } else {
      this.label = `(component "${componentPath}")`;
    }

    this.addDependency(componentPath);

    params.forEach(item => this.addDependency(item));

    Object.keys(hash).forEach(key => this.addDependency(hash[key]));
  },

  cell() {
    let componentPath = read(this.componentPath);
    let params = readArray(this.params);
    let hash = readHash(this.hash);
    let val = {
      componentPath,
      params,
      hash,
      [COMPONENT_CELL]: true
    };

    return val;
  }

});

export default function closureComponent(morph, env, scope, [componentPath, ...params], hash, template, inverse) {
  // This assumes is being called with morph being null
  return new ComponentStream(componentPath, params, hash);
}
