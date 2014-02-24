import MutableArrayTests from 'ember-runtime/tests/suites/mutable_array';
import ArrayProxy from "ember-runtime/system/array_proxy";
import {A} from "ember-runtime/mixins/array";
import {get} from "ember-metal/property_get";

MutableArrayTests.extend({

  name: 'Ember.ArrayProxy',

  newObject: function(ary) {
    var ret = ary ? ary.slice() : this.newFixture(3);
    return ArrayProxy.create({ content: A(ret) });
  },

  mutate: function(obj) {
    obj.pushObject(get(obj, 'length')+1);
  },

  toArray: function(obj) {
    return obj.toArray ? obj.toArray() : obj.slice();
  }

}).run();
