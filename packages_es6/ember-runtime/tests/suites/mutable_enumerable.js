import {EnumerableTests, ObserverClass} from 'ember-runtime/tests/suites/enumerable';

var MutableEnumerableTests = EnumerableTests.extend();

require('ember-runtime/~tests/suites/mutable_enumerable/addObject');
require('ember-runtime/~tests/suites/mutable_enumerable/removeObject');

export default MutableEnumerableTests;
