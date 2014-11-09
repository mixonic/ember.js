/**
@module ember
@submodule ember-htmlbars
*/

import View from "ember-views/views/view";
import Component from "ember-views/views/component";
import makeViewHelper from "./system/make-view-helper";

var helpers = { };

/**
  Register a bound helper or custom view helper.

  ## Simple bound helper example

  ```javascript
  Ember.HTMLBars.helper('capitalize', function(value) {
    return value.toUpperCase();
  });
  ```

  The above bound helper can be used inside of templates as follows:

  ```handlebars
  {{capitalize name}}
  ```

  In this case, when the `name` property of the template's context changes,
  the rendered value of the helper will update to reflect this change.

  For more examples of bound helpers, see documentation for
  `Ember.HTMLBars.registerBoundHelper`.

  ## Custom view helper example

  Assuming a view subclass named `App.CalendarView` were defined, a helper
  for rendering instances of this view could be registered as follows:

  ```javascript
  Ember.HTMLBars.helper('calendar', App.CalendarView):
  ```

  The above bound helper can be used inside of templates as follows:

  ```handlebars
  {{calendar}}
  ```

  Which is functionally equivalent to:

  ```handlebars
  {{view 'calendar'}}
  ```

  Options in the helper will be passed to the view in exactly the same
  manner as with the `view` helper.

  @method helper
  @for Ember.HTMLBars
  @param {String} name
  @param {Function|Ember.View} function or view class constructor
  @param {String} dependentKeys*
*/
export function helper(name, value) {
  Ember.assert("You tried to register a component named '" + name +
               "', but component names must include a '-'", !Component.detect(value) || name.match(/-/));

  if (View.detect(value)) {
    registerHelper(name, makeViewHelper(value));
  } else {
    // HTMLBars TODO: Support bound helpers
    // EmberHandlebars.registerBoundHelper.apply(null, arguments);
    throw new Error('unimplemented');
  }
}

export function registerHelper(name, value) {
  helpers[name] = value;
}

export default helpers;
