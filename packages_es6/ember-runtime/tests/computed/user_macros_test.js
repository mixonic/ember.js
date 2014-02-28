import Ember from 'ember-metal/core';
import {get} from 'ember-metal/property_get';
import {set} from 'ember-metal/property_set';
import {computed} from 'ember-metal/computed';
import {map} from 'ember-metal/array';
import run from 'ember-metal/run_loop';
import EmberObject from 'ember-runtime/system/object';
import testBoth from 'ember-metal/tests/props_helper';

if (Ember.FEATURES.isEnabled('composable-computed-properties')) {
  var a_slice = Array.prototype.slice,
      normalizeDependentKeys = computed.normalizeDependentKeys,
      union = computed.union,
      obj,
      join;

  module('Ember.computed - user macros', {
    setup: function () {
      join = function () {
        var separator = a_slice.call(arguments, -1),
            dependentKeys = a_slice.call(arguments, 0, -1),
            normalizedKeys = normalizeDependentKeys(dependentKeys),
            args = a_slice.call(dependentKeys);

        args.push(function () {
          return map.call(normalizedKeys, function (key) {
            return get(this, key);
          }, this).join(separator);
        });

        return computed.apply(computed, args);
      };
    },
    teardown: function () {
      if (obj && obj.destroy) {
        run(function() {
          obj.destroy();
        });
      }
    }
  });

  test('user macros can easily support composition', function () {
    obj = EmberObject.extend({
      both: join( join('person0FirstName', 'person0LastName', " "),
                  join('person1FirstName', 'person1LastName', " "),
                  " and ")
    }).create({
      person0FirstName: "Jaime",
      person0LastName: "Lannister",

      person1FirstName: "Cersei",
      person1LastName: "Lannister"
    });

    equal(get(obj, 'both'), ["Jaime Lannister and Cersei Lannister"], "composed `join` is initially correct");

    set(obj, 'person0FirstName',  ['Tyrion']);
    set(obj, 'person1FirstName',  ['Sansa']);
    set(obj, 'person1LastName',   ['Stark']);

    equal(get(obj, 'both'), ["Tyrion Lannister and Sansa Stark"], "composed `join` is correct after updating");
  });
}
