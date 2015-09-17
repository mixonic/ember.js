import assign from 'ember-metal/assign';
import {
  COMPONENT_CELL,
  COMPONENT_PATH,
  COMPONENT_POSITIONAL_PARAMS,
  COMPONENT_HASH,
  mergeHash,
} from  './closure-component';
import { processPositionalParams } from 'ember-htmlbars/utils/extract-positional-params';

export default {
  setupState(lastState, env, scope, params, hash) {
    let componentPath = getComponentPath(params[0], env);
    return assign({}, lastState, {
      componentPath,
      isComponentHelper: true
    });
  },

  render(morph, ...rest) {
    let state = morph.getState();

    if (state.manager) {
      state.manager.destroy();
    }

    // Force the component hook to treat this as a first-time render,
    // because normal components (`<foo-bar>`) cannot change at runtime,
    // but the `{{component}}` helper can.
    state.manager = null;

    render(morph, ...rest);
  },

  rerender: render
};

function getComponentPath(param, env) {
  let path = env.hooks.getValue(param);
  if (path && path[COMPONENT_CELL]) {
    path = path[COMPONENT_PATH];
  }
  return path;
}

function render(morph, env, scope, [path, ...params], hash, template, inverse, visitor) {
  let {
    componentPath
  } = morph.getState();

  path = env.hooks.getValue(path);

  if (path && path[COMPONENT_CELL]) {
    let closureComponent = env.hooks.getValue(path);
    let positionalParams = closureComponent[COMPONENT_POSITIONAL_PARAMS];
    processPositionalParams(null, positionalParams, params, hash);
    params = [];
    hash = mergeHash(closureComponent[COMPONENT_HASH], hash);
  }

  // If the value passed to the {{component}} helper is undefined or null,
  // don't create a new ComponentNode.
  if (componentPath === undefined || componentPath === null) {
    return;
  }

  let templates = { default: template, inverse };
  env.hooks.component(
    morph, env, scope, componentPath,
    params, hash, templates, visitor
  );
}
