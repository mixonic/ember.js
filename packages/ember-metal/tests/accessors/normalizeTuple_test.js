/*globals Foo:true, $foo:true */
import { normalizeTuple } from "ember-metal/property_get";

var obj;
var moduleOpts = {
  setup: function() {
    obj = {
      foo: {
        bar: {
          baz: {}
        }
      }
    };

    window.Foo = {
      bar: {
        baz: {}
      }
    };

    window.$foo = {
      bar: {
        baz: {}
      }
    };
  },

  teardown: function() {
    obj = undefined;
    window.Foo = undefined;
    window.$foo = undefined;
  }
};

QUnit.module('normalizeTuple', moduleOpts);

// ..........................................................
// LOCAL PATHS
//

test('[obj, foo] -> [obj, foo]', function() {
  deepEqual(normalizeTuple(obj, 'foo'), [obj, 'foo']);
});

test('[obj, *] -> [obj, *]', function() {
  deepEqual(normalizeTuple(obj, '*'), [obj, '*']);
});

test('[obj, foo.bar] -> [obj, foo.bar]', function() {
  deepEqual(normalizeTuple(obj, 'foo.bar'), [obj, 'foo.bar']);
});

test('[obj, foo.*] -> [obj, foo.*]', function() {
  deepEqual(normalizeTuple(obj, 'foo.*'), [obj, 'foo.*']);
});

test('[obj, foo.*.baz] -> [obj, foo.*.baz]', function() {
  deepEqual(normalizeTuple(obj, 'foo.*.baz'), [obj, 'foo.*.baz']);
});

test('[obj, this.foo] -> [obj, foo]', function() {
  deepEqual(normalizeTuple(obj, 'this.foo'), [obj, 'foo']);
});

test('[obj, this.foo.bar] -> [obj, foo.bar]', function() {
  deepEqual(normalizeTuple(obj, 'this.foo.bar'), [obj, 'foo.bar']);
});

test('[obj, this.Foo.bar] -> [obj, Foo.bar]', function() {
  deepEqual(normalizeTuple(obj, 'this.Foo.bar'), [obj, 'Foo.bar']);
});

// ..........................................................
// GLOBAL PATHS
//
test('[obj, Foo] -> [Ember.lookup, Foo]', function() {
  deepEqual(normalizeTuple(obj, 'Foo'), [Ember.lookup, 'Foo']);
});

test('[obj, Foo.bar] -> [Foo, bar]', function() {
  deepEqual(normalizeTuple(obj, 'Foo.bar'), [Foo, 'bar']);
});

test('[obj, $foo.bar.baz] -> [$foo, bar.baz]', function() {
  deepEqual(normalizeTuple(obj, '$foo.bar.baz'), [$foo, 'bar.baz']);
});

// ..........................................................
// NO TARGET
//

test('[null, Foo] -> [Ember.lookup, Foo]', function() {
  deepEqual(normalizeTuple(null, 'Foo'), [Ember.lookup, 'Foo']);
});

test('[null, Foo.bar] -> [Foo, bar]', function() {
  deepEqual(normalizeTuple(null, 'Foo.bar'), [Foo, 'bar']);
});

test("[null, foo] -> [undefined, '']", function() {
  deepEqual(normalizeTuple(null, 'foo'), [undefined, '']);
});

test("[null, foo.bar] -> [undefined, '']", function() {
  deepEqual(normalizeTuple(null, 'foo'), [undefined, '']);
});

test('[null, $foo] -> [Ember.lookup, $foo]', function() {
  deepEqual(normalizeTuple(null, '$foo'), [Ember.lookup, '$foo']);
});

test('[null, $foo.bar] -> [$foo, bar]', function() {
  deepEqual(normalizeTuple(null, '$foo.bar'), [$foo, 'bar']);
});
