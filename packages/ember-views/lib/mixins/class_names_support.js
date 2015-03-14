import Ember from 'ember-metal/core';
import { Mixin } from "ember-metal/mixin";
import { A as emberA } from "ember-runtime/system/native_array";
import {
  forEach,
  addObject
} from "ember-metal/enumerable_utils";
import {
  subscribe,
  read,
  isStream,
  compactConcat
} from "ember-metal/streams/utils";
import AttrNode from "ember-views/attr_nodes/attr_node";
import {
  streamifyClassNameBinding,
  streamifyClassNameBindingArray,
} from "ember-views/streams/class_name_binding";
import {
  typeOf
} from "ember-metal/utils";

var EMPTY_ARRAY = [];

var ClassNamesSupport = Mixin.create({
  concatenatedProperties: ['classNames', 'classNameBindings'],

  init: function() {
    this._super.apply(this, arguments);

    Ember.assert("Only arrays are allowed for 'classNameBindings'", typeOf(this.classNameBindings) === 'array');
    this.classNameBindings = emberA(this.classNameBindings.slice());

    Ember.assert("Only arrays of static class strings are allowed for 'classNames'. For dynamic classes, use 'classNameBindings'.", typeOf(this.classNames) === 'array');
    this.classNames = emberA(this.classNames.slice());
  },

  /**
    Standard CSS class names to apply to the view's outer element. This
    property automatically inherits any class names defined by the view's
    superclasses as well.

    @property classNames
    @type Array
    @default ['ember-view']
  */
  classNames: ['ember-view'],

  /**
    A list of properties of the view to apply as class names. If the property
    is a string value, the value of that string will be applied as a class
    name.

    ```javascript
    // Applies the 'high' class to the view element
    Ember.View.extend({
      classNameBindings: ['priority']
      priority: 'high'
    });
    ```

    If the value of the property is a Boolean, the name of that property is
    added as a dasherized class name.

    ```javascript
    // Applies the 'is-urgent' class to the view element
    Ember.View.extend({
      classNameBindings: ['isUrgent']
      isUrgent: true
    });
    ```

    If you would prefer to use a custom value instead of the dasherized
    property name, you can pass a binding like this:

    ```javascript
    // Applies the 'urgent' class to the view element
    Ember.View.extend({
      classNameBindings: ['isUrgent:urgent']
      isUrgent: true
    });
    ```

    This list of properties is inherited from the view's superclasses as well.

    @property classNameBindings
    @type Array
    @default []
  */
  classNameBindings: EMPTY_ARRAY,

  /**
    Iterates over the view's `classNameBindings` array, inserts the value
    of the specified property into the `classNames` array, then creates an
    observer to update the view's element if the bound property ever changes
    in the future.

    @method _applyClassNameBindings
    @private
  */
  _applyClassNameBindings: function() {
    var classStringParts = [];
    if (this.classNames.length === 1) {
      classStringParts.push(this.classNames[0]);
    } else if (this.classNames.length > 1) {
      classStringParts.push(this.classNames.join(' '));
    }

    if (this.classNameBindings.length === 1) {
      classStringParts.push(streamifyClassNameBinding(this, this.classNameBindings[0], '_view.'));
    } else if (this.classNameBindings.length > 1) {
      classStringParts.push(streamifyClassNameBindingArray(this, this.classNameBindings, '_view.'));
    }

    if (classStringParts.length > 0) {
      var attrNode = new AttrNode('class', compactConcat(classStringParts, ' '));
      this.appendAttrBindingNode(attrNode);
    }
  }
});

export default ClassNamesSupport;
