/*globals ENV */

// require('ember-metal');

/**
@module ember
@submodule ember-runtime
*/

import EnumerableUtils from "ember-metal/enumerable_utils";
import {create} from "ember-metal/platform";

var indexOf = EnumerableUtils.indexOf;

function _copy(obj, deep, seen, copies) {
  var ret, loc, key;

  // primitive data types are immutable, just return them.
  if ('object' !== typeof obj || obj===null) return obj;

  // avoid cyclical loops
  if (deep && (loc=indexOf(seen, obj))>=0) return copies[loc];

  Ember.assert('Cannot clone an Ember.Object that does not implement Ember.Copyable', !(obj instanceof Ember.Object) || (Ember.Copyable && Ember.Copyable.detect(obj)));

  // IMPORTANT: this specific test will detect a native array only. Any other
  // object will need to implement Copyable.
  if (Ember.typeOf(obj) === 'array') {
    ret = obj.slice();
    if (deep) {
      loc = ret.length;
      while(--loc>=0) ret[loc] = _copy(ret[loc], deep, seen, copies);
    }
  } else if (Ember.Copyable && Ember.Copyable.detect(obj)) {
    ret = obj.copy(deep, seen, copies);
  } else {
    ret = {};
    for(key in obj) {
      if (!obj.hasOwnProperty(key)) continue;

      // Prevents browsers that don't respect non-enumerability from
      // copying internal Ember properties
      if (key.substring(0,2) === '__') continue;

      ret[key] = deep ? _copy(obj[key], deep, seen, copies) : obj[key];
    }
  }

  if (deep) {
    seen.push(obj);
    copies.push(ret);
  }

  return ret;
}

/**
  Creates a clone of the passed object. This function can take just about
  any type of object and create a clone of it, including primitive values
  (which are not actually cloned because they are immutable).

  If the passed object implements the `clone()` method, then this function
  will simply call that method and return the result.

  @method copy
  @for Ember
  @param {Object} obj The object to clone
  @param {Boolean} deep If true, a deep copy of the object is made
  @return {Object} The cloned object
*/
function copy(obj, deep) {
  // fast paths
  if ('object' !== typeof obj || obj===null) return obj; // can't copy primitives
  if (Ember.Copyable && Ember.Copyable.detect(obj)) return obj.copy(deep);
  return _copy(obj, deep, deep ? [] : null, deep ? [] : null);
};

/**
  Compares two objects, returning true if they are logically equal. This is
  a deeper comparison than a simple triple equal. For sets it will compare the
  internal objects. For any other object that implements `isEqual()` it will
  respect that method.

  ```javascript
  Ember.isEqual('hello', 'hello');  // true
  Ember.isEqual(1, 2);              // false
  Ember.isEqual([4,2], [4,2]);      // false
  ```

  @method isEqual
  @for Ember
  @param {Object} a first object to compare
  @param {Object} b second object to compare
  @return {Boolean}
*/
function isEqual(a, b) {
  if (a && 'function'===typeof a.isEqual) return a.isEqual(b);
  return a === b;
};

/**
  Returns all of the keys defined on an object or hash. This is useful
  when inspecting objects for debugging. On browsers that support it, this
  uses the native `Object.keys` implementation.

  @method keys
  @for Ember
  @param {Object} obj
  @return {Array} Array containing keys of obj
*/
var keys = Object.keys;
if (keys || create.isSimulated) {
  var prototypeProperties = [
    'constructor',
    'hasOwnProperty',
    'isPrototypeOf',
    'propertyIsEnumerable',
    'valueOf',
    'toLocaleString',
    'toString'
  ],
  pushPropertyName = function(obj, array, key) {
    // Prevents browsers that don't respect non-enumerability from
    // copying internal Ember properties
    if (key.substring(0,2) === '__') return;
    if (key === '_super') return;
    if (indexOf(array, key) >= 0) return;
    if (!obj.hasOwnProperty(key)) return;

    array.push(key);
  };

  keys = function keys(obj) {
    var ret = [], key;
    for (key in obj) {
      pushPropertyName(obj, ret, key);
    }

    // IE8 doesn't enumerate property that named the same as prototype properties.
    for (var i = 0, l = prototypeProperties.length; i < l; i++) {
      key = prototypeProperties[i];

      pushPropertyName(obj, ret, key);
    }

    return ret;
  };
}

export {copy, isEqual, keys}
