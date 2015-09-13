import Ember from 'ember-metal/core';
import Registry from 'container/registry';
import { runAppend, runDestroy } from 'ember-runtime/tests/utils';
import ComponentLookup from 'ember-views/component_lookup';
import Component from 'ember-views/components/component';
import compile from 'ember-template-compiler/system/compile';
import run from 'ember-metal/run_loop';

let component, registry, container;

if (Ember.FEATURES.isEnabled('ember-contextual-components')) {
  QUnit.module('ember-htmlbars: closure component helper', {
    setup() {
      registry = new Registry();
      container = registry.container();

      registry.optionsForType('template', { instantiate: false });
      registry.register('component-lookup:main', ComponentLookup);
    },

    teardown() {
      runDestroy(component);
      runDestroy(container);
      registry = container = component = null;
    }
  });

  QUnit.test('renders with component helper', function() {
    let expectedText = 'Hodi';
    registry.register(
      'template:components/-looked-up',
      compile(expectedText)
    );

    let template = compile('{{component (component "-looked-up")}}');
    component = Component.extend({ container, template }).create();

    runAppend(component);
    equal(component.$().text(), expectedText, '-looked-up component rendered');
  });

  QUnit.test('renders with component helper with invocation params, hash', function() {
    let LookedUp = Component.extend();
    LookedUp.reopenClass({
      positionalParams: ['name']
    });
    registry.register(
      'component:-looked-up',
      LookedUp
    );
    registry.register(
      'template:components/-looked-up',
      compile(`{{greeting}} {{name}}`)
    );

    let template = compile(
      `{{component (component "-looked-up") "Hodari" greeting="Hodi"}}`
    );
    component = Component.extend({ container, template }).create();

    runAppend(component);
    equal(component.$().text(), 'Hodi Hodari', '-looked-up component rendered');
  });

  QUnit.test('renders with component helper with curried params, hash', function() {
    let LookedUp = Component.extend();
    LookedUp.reopenClass({
      positionalParams: ['name']
    });
    registry.register(
      'component:-looked-up',
      LookedUp
    );
    registry.register(
      'template:components/-looked-up',
      compile(`{{greeting}} {{name}}`)
    );

    let template = compile(
      `{{component (component "-looked-up" "Hodari" greeting="Hodi") greeting="Hola"}}`
    );
    component = Component.extend({ container, template }).create();

    runAppend(component);
    equal(component.$().text(), 'Hola Hodari', '-looked-up component rendered');
  });

  QUnit.test('updates when component path is bound', function() {
    registry.register(
      'template:components/-mandarin',
      compile(`ni hao`)
    );
    registry.register(
      'template:components/-hindi',
      compile(`Namaste`)
    );

    let template = compile('{{component (component lookupComponent)}}');
    component = Component.extend({ container, template }).create();

    runAppend(component);
    equal(component.$().text(), ``, 'undefined lookupComponent does not render');
    run(() => {
      component.set('lookupComponent', '-mandarin');
    });
    equal(component.$().text(), `ni hao`,
          'mandarin lookupComponent renders greeting');
    run(() => {
      component.set('lookupComponent', '-hindi');
    });
    equal(component.$().text(), `Namaste`,
          'hindi lookupComponent renders greeting');
  });

  QUnit.test('updates when curried hash argument is bound', function() {
    registry.register(
      'template:components/-looked-up',
      compile(`{{greeting}}`)
    );

    let template = compile(
      `{{component (component "-looked-up" greeting=greeting)}}`
    );
    component = Component.extend({ container, template }).create();

    runAppend(component);
    equal(component.$().text(), '', '-looked-up component rendered');
    run(() => {
      component.set('greeting', 'Hodi');
    });
    equal(component.$().text(), `Hodi`,
          'greeting is bound');
  });
}
