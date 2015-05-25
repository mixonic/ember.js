import { validateLazyHelperName } from "ember-htmlbars/system/lookup-helper";

export default function hasHelperHook(env, scope, helperName) {
  if (env.helpers[helperName]) {
    return true;
  }

  var container = env.container;
  if (validateLazyHelperName(helperName, container, env.hooks.keywords)) {
    var containerName = 'helper:' + helperName;
    if (container._registry.has(containerName)) {
      return true;
    }

    var componentLookup = container.lookup('component-lookup:main');
    Ember.assert("Could not find 'component-lookup:main' on the provided container," +
                 " which is necessary for performing component lookups", componentLookup);

    if (container._registry.has('component:' + path) ||
        container._registry.has('template:components/' + path)) {
      return true;
    }
  }

  return false;
}
