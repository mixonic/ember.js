import CopyableTests from 'ember-runtime/tests/suites/copyable';
import {generateGuid} from 'ember-metal/utils';
import {A} from "ember-runtime/mixins/array";

// ..........................................................
// COPYABLE TESTS
//
CopyableTests.extend({
  name: 'NativeArray Copyable',

  newObject: function() {
    return A([generateGuid()]);
  },

  isEqual: function(a,b) {
    if (!(a instanceof Array)) return false;
    if (!(b instanceof Array)) return false;
    if (a.length !== b.length) return false;
    return a[0]===b[0];
  },

  shouldBeFreezable: false
}).run();

module("NativeArray Copyable");

test("deep copy is respected", function() {
  var array = A([ { id: 1 }, { id: 2 }, { id: 3 } ]);

  var copiedArray = array.copy(true);

  deepEqual(copiedArray, array, "copied array is equivalent");
  ok(copiedArray[0] !== array[0], "objects inside should be unique");
});
