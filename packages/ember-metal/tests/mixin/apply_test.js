/*globals raises */

module('Ember.Mixin.apply');

function K() {}

test('using apply() should apply properties', function() {
  var MixinA = Ember.Mixin.create({ foo: 'FOO', baz: K });
  var obj = {};
  Ember.mixin(obj, MixinA);

  equal(Ember.get(obj, 'foo'), "FOO", 'should apply foo');
  equal('function', typeof Ember.get(obj, 'baz'), 'should apply baz');
});

test('applying anonymous properties', function() {
  var obj = {};
  Ember.mixin(obj, {
    foo: 'FOO',
    baz: K
  });

  equal(Ember.get(obj, 'foo'), "FOO", 'should apply foo');
  equal('function', typeof Ember.get(obj, 'baz'), 'should apply baz');
});

test('applying null values', function() {
  expectAssertion(function() {
    Ember.mixin({}, null);
  });
});

test('applying a property with an undefined value', function() {
  var obj = { tagName: '' };
  Ember.mixin(obj, { tagName: undefined });

  strictEqual(Ember.get(obj, 'tagName'), '');
});
