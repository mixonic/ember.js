import Ember from 'ember-metal/core'; // Ember.assert
import { buildHelperStream } from "ember-htmlbars/system/invoke-helper";

export default function invokeHelper(morph, env, scope, visitor, params, hash, helper, templates, context) {

  if (helper.isLegacyViewHelper) {
    Ember.assert("You can only pass attributes (such as name=value) not bare " +
                 "values to a helper for a View found in '" + helper.viewClass + "'", params.length === 0);

    env.hooks.keyword('view', morph, env, scope, [helper.viewClass], hash, templates.template.raw, null, visitor);
    return { handled: true };
  }

  var helperStream = buildHelperStream(helper, params, hash, templates, env, scope, context);
  // FIXME this is obviously insane.
  if (morph) {
    helperStream.subscribe(function() {
      morph.setContent(helperStream.value());
    });
    morph.addDestruction(helperStream);
    return { value: helperStream.value() };
  } else {
    // FIXME when is this hit?
    return helperStream;
  }
}
