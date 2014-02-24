import MutableArrayTests from 'ember-runtime/tests/suites/mutable_array';
import {A} from "ember-runtime/mixins/array";

MutableArrayTests.extend({

  name: 'Native Array',

  newObject: function(ary) {
    return A(ary ? ary.slice() : this.newFixture(3));
  },

  mutate: function(obj) {
    obj.pushObject(obj.length+1);
  },

  toArray: function(obj) {
    return obj.slice(); // make a copy.
  }

}).run();
