import Registry from 'container/registry';
import compile from 'ember-template-compiler/system/compile';
import ComponentLookup from 'ember-views/component_lookup';
import Component from 'ember-views/components/component';
import { runAppend, runDestroy } from 'ember-runtime/tests/utils';
import Ember from 'ember-metal/core';

var registry, container, component;

QUnit.module('closure component - invocation', {
  setup() {
    registry = new Registry();
    container = registry.container();
    registry.optionsForType('template', { instantiate: false });
    registry.register('component-lookup:main', ComponentLookup);
  },

  teardown() {
    runDestroy(container);
    runDestroy(component);
    registry = container = component = null;
  }
});

if (Ember.FEATURES.isEnabled('ember-contextual-components')) {
  QUnit.test('non-block without properties', function() {
    expect(1);

    registry.register(
      'template:components/-looked-up',
      compile(`Howdy`)
    );

    let template = compile(
      `{{#with (hash lookedUp=(component "-looked-up")) as |components|}}{{components.lookedUp}}{{/with}}`
    );
    component = Component.extend({ container, template }).create();

    runAppend(component);
    equal(component.$().text(), 'Howdy', '-looked-up component rendered');
  });
}
