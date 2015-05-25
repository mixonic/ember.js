/**
@module ember
@submodule ember-htmlbars
*/

import Ember from "ember-metal/core";
import Cache from "ember-metal/cache";
import makeViewHelper from "ember-htmlbars/system/make-view-helper";
import HandlebarsCompatibleHelper from "ember-htmlbars/compat/helper";

export var CONTAINS_DASH_CACHE = new Cache(1000, function(key) {
  return key.indexOf('-') !== -1;
});

export function validateLazyHelperName(helperName, container, keywords) {
  return container && CONTAINS_DASH_CACHE.get(helperName) && !(helperName in keywords);
};

/**
  Used to lookup/resolve handlebars helpers. The lookup order is:

  * Look for a registered helper
  * If a dash exists in the name:
    * Look for a helper registed in the container
    * Use Ember.ComponentLookup to find an Ember.Component that resolves
      to the given name

  @private
  @method resolveHelper
  @param {Container} container
  @param {String} name the name of the helper to lookup
  @return {Handlebars Helper}
*/
export function findHelper(name, view, env) {
  var helper = env.helpers[name];
  if (helper) {
    return helper;
  }

  var container = env.container;
  if (validateLazyHelperName(name, container, env.hooks.keywords)) {
    var helperName = 'helper:' + name;

    helper = container.lookup(helperName);

    if (helper && !helper.isHTMLBars && !helper.isHelper) {
      helper = new HandlebarsCompatibleHelper(helper);
      container._registry.unregister(helperName);
      container._registry.register(helperName, helper);
    }

    if (!helper) {
      var componentLookup = container.lookup('component-lookup:main');
      Ember.assert("Could not find 'component-lookup:main' on the provided container," +
                   " which is necessary for performing component lookups", componentLookup);

      var Component = componentLookup.lookupFactory(name, container);
      if (Component) {
        helper = makeViewHelper(Component);
        container._registry.register(helperName, helper);
      }
    }

    return helper;
  }
}

export default function lookupHelper(name, view, env) {
  let helper = findHelper(name, view, env);

  Ember.assert(`A helper named '${name}' could not be found`, !!helper);

  return helper;
}
