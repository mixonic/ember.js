import {EnumerableTests, ObserverClass} from 'ember-runtime/tests/enumerable/base';

var suite = EnumerableTests;

suite.module('toArray');

suite.test('toArray should convert to an array', function() {
  var obj = this.newObject();
  deepEqual(obj.toArray(), this.toArray(obj));
});

