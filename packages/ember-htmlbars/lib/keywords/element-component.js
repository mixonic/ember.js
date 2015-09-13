import assign from 'ember-metal/assign';
import {
  COMPONENT_REFERENCE,
  COMPONENT_CELL,
  COMPONENT_PATH,
  COMPONENT_PARAMS,
  COMPONENT_HASH,
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
  let componentName =  env.hooks.getValue(param);
  if (componentName[COMPONENT_CELL]) {
    componentName = componentName[COMPONENT_PATH];
  }
  return componentName;
}

function render(morph, env, scope, params, hash, template, inverse, visitor) {
  let {
    componentPath
  } = morph.getState();

  if (params[0] && params[0][COMPONENT_REFERENCE]) {
    let closureComponent = env.hooks.getValue(params[0]);
    params = mergeParams([componentPath], closureComponent[COMPONENT_PARAMS], params.slice(1));
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

function mergeParams(...paramsArray) {
  let mergedParams = [];
  for (let i=0; i<paramsArray.length; i++) {
    mergedParams.splice(mergedParams.length, 0, ...paramsArray[i]);
  }
  return mergedParams;
}

function mergeHash(...hashArray) {
  return assign({}, ...hashArray);
}
