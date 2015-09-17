import CoreObject from 'ember-runtime/system/core_object';

QUnit.module('Ember.CoreObject');

QUnit.test('works with new (one arg)', function() {
  var Welcomer = CoreObject.extend({
    init(greeting) {
      this.greeting = greeting;
    }
  });
  var o = new Welcomer('Bonjour');
  equal(o.greeting, 'Bonjour', 'first positional arg is passed');
});

QUnit.test('works with new (> 1 arg)', function() {
  var Welcomer = CoreObject.extend({
    init(greeting, name) {
      this.greeting = `${greeting} ${name}`;
    }
  });
  var o = new Welcomer('Bonjour', 'Bob');
  equal(o.greeting, 'Bonjour Bob', 'first and second positional args are passed');
});

QUnit.test('works with new and inheritance', function() {
  var Welcomer = CoreObject.extend({
    init(greeting, name) {
      this.greeting = `${greeting} ${name}`;
    }
  });
  var FrenchWelcomer = Welcomer.extend({
    init(name) {
      this._super('Bonjour', name);
    }
  });
  var o = new FrenchWelcomer('Bob');

  equal(o.greeting, 'Bonjour Bob', 'positional args are passed');
});
