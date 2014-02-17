/**
Ember Runtime

@module ember
@submodule ember-runtime
@requires ember-metal
*/

// require('container');
// require('ember-metal');
// require('ember-runtime/core');
require('ember-runtime/computed/reduce_computed_macros');
// require('ember-runtime/ext');
// require('ember-runtime/system');
require('ember-runtime/controllers');

// IMPORTS
import Ember from "ember-metal/core";
import {compare, copy, isEqual, keys} from "ember-runtime/core";
import {EmberArray, Enumerable, Comparable, Copyable, Freezable, FROZEN_ERROR} from "ember-runtime/mixins";
import {EmberString} from "ember-runtime/ext";
import {Namespace, EmberObject, TrackedArray, SubArray, Container, Application, ArrayProxy, ObjectProxy, ActionHandler, CoreObject, EachArray, EachProxy, NativeArray, A, Set} from "ember-runtime/system";

// Exports
Ember.compare = compare;
Ember.copy = copy;
Ember.isEqual = isEqual;
Ember.keys = keys;

Ember.Array = EmberArray;

Ember.Comparable = Comparable;
Ember.Copyable = Copyable;

Ember.Freezable = Freezable;
Ember.FROZEN_ERROR = FROZEN_ERROR;

Ember.String = EmberString;
Ember.Object = EmberObject;
Ember.TrackedArray = TrackedArray;
Ember.SubArray = SubArray;
Ember.Container = Container;
Ember.Application = Application;
Ember.Enumerable = Enumerable;
Ember.ArrayProxy = ArrayProxy;
Ember.ObjectProxy = ObjectProxy;
Ember.ActionHandler = ActionHandler;
Ember.CoreObject = CoreObject;
Ember.EachArray = EachArray;
Ember.EachProxy = EachProxy;
Ember.NativeArray = NativeArray;
Ember.A = A;
Ember.Set = Set;
