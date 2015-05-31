import Ember from 'ember-metal/core'; // Ember.assert
import getValue from "ember-htmlbars/hooks/get-value";

export default function invokeHelper(morph, env, scope, visitor, _params, _hash, helper, templates, context) {
  var params, hash;

  if (helper.isHelper) {
    Ember.assert("makeBoundHelper generated helpers do not support use with blocks", !templates.template.meta);
    params = getArrayValues(_params);
    hash = getHashValues(_hash);
    var helperStream = helper.getStream(params, hash);
    helperStream.subscribe(function() {
      morph.setContent(helperStream.value());
    });
    return { value: helperStream.value() };
  } else if (typeof helper === 'function') {
    params = getArrayValues(_params);
    hash = getHashValues(_hash);
    return { value: helper.call(context, params, hash, templates) };
  } else if (helper.isLegacyViewHelper) {
    Ember.assert("You can only pass attributes (such as name=value) not bare " +
                 "values to a helper for a View found in '" + helper.viewClass + "'", _params.length === 0);

    env.hooks.keyword('view', morph, env, scope, [helper.viewClass], _hash, templates.template.raw, null, visitor);
    return { handled: true };
  } else if (helper && helper.helperFunction) {
    var helperFunc = helper.helperFunction;
    return { value: helperFunc.call({}, _params, _hash, templates, env, scope) };
  }
}

// We don't want to leak mutable cells into helpers, which
// are pure functions that can only work with values.
function getArrayValues(params) {
  let out = [];
  for (let i=0, l=params.length; i<l; i++) {
    out.push(getValue(params[i]));
  }

  return out;
}

function getHashValues(hash) {
  let out = {};
  for (let prop in hash) {
    out[prop] = getValue(hash[prop]);
  }

  return out;
}
