/**
@module ember
@submodule ember-handlebars
*/

import isNone from 'ember-metal/is_none';
import run from "ember-metal/run_loop";
import SimpleStream from "ember-metal/streams/simple";

import {
  _HandlebarsBoundView,
  SimpleHandlebarsView
} from "ember-handlebars/views/handlebars_bound_view";

function exists(value) {
  return !isNone(value);
}

// Binds a property into the DOM. This will create a hook in DOM that the
// KVO system will look for and update if the property changes.
function bind(property, options, env, preserveContext, shouldDisplay, valueNormalizer, childProperties, _viewClass) {
  // we relied on the behavior of calling without
  // context to mean this === window, but when running
  // "use strict", it's possible for this to === undefined;
  var currentContext = this || window;

  var valueStream = property.isStream ? property : this.getStream(property);
  var lazyValue;

  if (childProperties) {
    lazyValue = new SimpleStream(valueStream);

    var subscriber = function(childStream) {
      childStream.value();
      lazyValue.notify();
    };

    for (var i = 0; i < childProperties.length; i++) {
      var childStream = valueStream.get(childProperties[i]);
      childStream.value();
      childStream.subscribe(subscriber);
    }
  } else {
    lazyValue = valueStream;
  }

  // Set up observers for observable objects
  var viewClass = _viewClass || _HandlebarsBoundView;
  var viewOptions = {
    _morph: options.morph,
    preserveContext: preserveContext,
    shouldDisplayFunc: shouldDisplay,
    valueNormalizerFunc: valueNormalizer,
    displayTemplate: options.render,
    inverseTemplate: options.inverse,
    lazyValue: lazyValue,
    previousContext: currentContext,
    isEscaped: !options.hash.unescaped,
    templateData: env.data,
    templateHash: options.hash,
    helperName: options.helperName
  };

  if (options.keywords) {
    viewOptions._keywords = options.keywords;
  }

  // Create the view that will wrap the output of this template/property
  // and add it to the nearest view's childViews array.
  // See the documentation of Ember._HandlebarsBoundView for more.
  var bindView = this.createChildView(viewClass, viewOptions);

  this.appendChild(bindView);

  lazyValue.subscribe(this._wrapAsScheduled(function() {
    run.scheduleOnce('render', bindView, 'rerenderIfNeeded');
  }));
}

function simpleBind(params, options, env) {
  var lazyValue = params[0];

  var view = new SimpleHandlebarsView(
    lazyValue, options.escaped
  );

  view._parentView = this;
  view._morph = options.morph;
  this.appendChild(view);

  lazyValue.subscribe(this._wrapAsScheduled(function() {
    run.scheduleOnce('render', view, 'rerender');
  }));
}

/**
  `bind` can be used to display a value, then update that value if it
  changes. For example, if you wanted to print the `title` property of
  `content`:

  ```handlebars
  {{bind "content.title"}}
  ```

  This will return the `title` property as a string, then create a new observer
  at the specified path. If it changes, it will update the value in DOM. Note
  that if you need to support IE7 and IE8 you must modify the model objects
  properties using `Ember.get()` and `Ember.set()` for this to work as it
  relies on Ember's KVO system. For all other browsers this will be handled for
  you automatically.

  @private
  @method bind
  @for Ember.Handlebars.helpers
  @param {String} property Property to bind
  @param {Function} fn Context to provide for rendering
  @return {String} HTML string
*/
function bindHelper(params, options, env) {
  Ember.assert("You must pass exactly one argument to the bind helper", params.length === 1);

  var property = params[0];

  if (options.fn) {
    options.helperName = 'bind';
    bind.call(this, property, options, env, false, exists);
  } else {
    simpleBind.call(this, params, options, env);
  }
}

export {
  bind,
  simpleBind,
  bindHelper
};
