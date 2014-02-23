import {EnumerableTests, ObserverClass} from 'ember-runtime/tests/enumerable/base';
import {get} from 'ember-metal/property_get';

var suite = EnumerableTests;

suite.module('firstObject');

suite.test('returns first item in enumerable', function() {
  var obj = this.newObject();
  equal(get(obj, 'firstObject'), this.toArray(obj)[0]);
});

suite.test('returns undefined if enumerable is empty', function() {
  var obj = this.newObject([]);
  equal(get(obj, 'firstObject'), undefined);
});
