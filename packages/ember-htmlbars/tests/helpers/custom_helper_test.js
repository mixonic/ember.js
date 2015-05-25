import Component from "ember-views/views/component";
import Helper from "ember-htmlbars/helper";
import compile from "ember-template-compiler/system/compile";
import { runAppend, runDestroy } from "ember-runtime/tests/utils";
import Registry from "container/registry";
import run from "ember-metal/run_loop";

let registry, container, component;

QUnit.module('ember-htmlbars: custom app helpers', {
  setup() {
    registry = new Registry();
    registry.optionsForType('template', { instantiate: false });
    registry.optionsForType('helper', { singleton: false });
    container = registry.container();
  },

  teardown() {
    runDestroy(component);
    runDestroy(container);
    registry = container = component = null;
  }
});

QUnit.test('dashed shorthand helper is resolved from container', function() {
  var HelloWorld = Helper.build(function() {
    return 'hello world';
  });
  registry.register('helper:hello-world', HelloWorld);
  component = Component.extend({
    container,
    layout: compile('{{hello-world}}')
  }).create();

  runAppend(component);
  equal(component.$().text(), 'hello world');
});

QUnit.test('dashed helper is resolved from container', function() {
  var HelloWorld = Helper.extend({
    compute() {
      return 'hello world';
    }
  });
  registry.register('helper:hello-world', HelloWorld);
  component = Component.extend({
    container,
    layout: compile('{{hello-world}}')
  }).create();

  runAppend(component);
  equal(component.$().text(), 'hello world');
});

QUnit.test('dashed helper can recompute a new value', function() {
  var count = 0;
  var helper;
  var didCreateHelper = false;
  var HelloWorld = Helper.extend({
    init() {
      this._super(...arguments);
      ok(!didCreateHelper, 'helper was created once');
      didCreateHelper = true;
      helper = this;
    },
    compute() {
      return ++count;
    }
  });
  registry.register('helper:hello-world', HelloWorld);
  component = Component.extend({
    container,
    layout: compile('{{hello-world}}')
  }).create();

  runAppend(component);
  equal(component.$().text(), '1');
  run(function() {
    helper.recompute();
  });
  equal(component.$().text(), '2');
});

QUnit.test('dashed shorthand helper is called for param changes', function() {
  var count = 0;
  var HelloWorld = Helper.build(function() {
    return ++count;
  });
  registry.register('helper:hello-world', HelloWorld);
  component = Component.extend({
    container,
    name: 'bob',
    layout: compile('{{hello-world name}}')
  }).create();

  runAppend(component);
  equal(component.$().text(), '1');
  run(function() {
    component.set('name', 'sal');
  });
  equal(component.$().text(), '2');
});

QUnit.test('dashed helper compute is called for param changes', function() {
  var count = 0;
  // var didCreateHelper = false;
  var HelloWorld = Helper.extend({
    init() {
      this._super(...arguments);
      // FIXME: Ideally, the helper instance does not need to be recreated
      // for change of params.
      // ok(!didCreateHelper, 'helper was created once');
      // didCreateHelper = true;
    },
    compute() {
      return ++count;
    }
  });
  registry.register('helper:hello-world', HelloWorld);
  component = Component.extend({
    container,
    name: 'bob',
    layout: compile('{{hello-world name}}')
  }).create();

  runAppend(component);
  equal(component.$().text(), '1');
  run(function() {
    component.set('name', 'sal');
  });
  equal(component.$().text(), '2');
});

QUnit.test('dashed shorthand helper receives params, hash', function() {
  var params, hash;
  var HelloWorld = Helper.build(function(_params, _hash) {
    params = _params;
    hash = _hash;
  });
  registry.register('helper:hello-world', HelloWorld);
  component = Component.extend({
    container,
    name: 'bob',
    layout: compile('{{hello-world name "rich" last="sam"}}')
  }).create();

  runAppend(component);

  equal(params[0], 'bob', 'first argument is bob');
  equal(params[1], 'rich', 'second argument is rich');
  equal(hash.last, 'sam', 'hash.last argument is sam');
});

QUnit.test('dashed helper receives params, hash', function() {
  var params, hash;
  var HelloWorld = Helper.extend({
    compute(_params, _hash) {
      params = _params;
      hash = _hash;
    }
  });
  registry.register('helper:hello-world', HelloWorld);
  component = Component.extend({
    container,
    name: 'bob',
    layout: compile('{{hello-world name "rich" last="sam"}}')
  }).create();

  runAppend(component);

  equal(params[0], 'bob', 'first argument is bob');
  equal(params[1], 'rich', 'second argument is rich');
  equal(hash.last, 'sam', 'hash.last argument is sam');
});
