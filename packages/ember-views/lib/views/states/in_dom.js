import create from 'ember-metal/platform/create';
import merge from "ember-metal/merge";
import EmberError from "ember-metal/error";
import { addBeforeObserver } from 'ember-metal/observer';

import hasElement from "ember-views/views/states/has_element";
/**
@module ember
@submodule ember-views
*/

var inDOM = create(hasElement);

merge(inDOM, {
  enter: function(view) {
    // Register the view for event handling. This hash is used by
    // Ember.EventDispatcher to dispatch incoming events.
    if (!view.isVirtual) {
      view._register();
    }

    Ember.runInDebug(function() {
      addBeforeObserver(view, 'elementId', function() {
        throw new EmberError("Changing a view's elementId after creation is not allowed");
      });
    });
  },

  exit: function(view) {
    if (!this.isVirtual) {
      view._unregister();
    }
  },

  appendAttrBindingNode: function(view, attrNode) {
    view._attrBindingNodes.push(attrNode);

    attrNode._parentView = view;
    view.renderer.appendAttrTo(attrNode, view.element, attrNode.attrName);
  }

});

export default inDOM;
