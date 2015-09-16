import assign from 'ember-metal/assign';
import {
  COMPONENT_REFERENCE,
  COMPONENT_PATH,
  COMPONENT_PARAMS,
  COMPONENT_HASH,
  mergeHash,
  mergeParams
} from  './closure-component';

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
  if (param[COMPONENT_REFERENCE]) {
    path = path[COMPONENT_PATH];
  }
  return path;
}

function render(morph, env, scope, [path, ...params], hash, template, inverse, visitor) {
  let {
    componentPath
  } = morph.getState();

  if (path && path[COMPONENT_REFERENCE]) {
    let closureComponent = env.hooks.getValue(path);
    params = mergeParams(closureComponent[COMPONENT_PARAMS], params);
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
