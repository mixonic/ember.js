import { run } from 'ember-metal';
import { Application } from 'ember-application';
import { jQuery } from 'ember-views';
import Resolver from 'internal-test-helpers/test-resolver';

let App, appInstance, resolver;

QUnit.module('Top Level DOM Structure', {
  setup() {
    run(() => {
      App = Application.create({
        name: 'App',
        rootElement: '#qunit-fixture',
        Resolver
      });

      App.deferReadiness();

      App.Router.reopen({
        location: 'none'
      });

      appInstance = App.__deprecatedInstance__;
      resolver = Resolver.lastInstance;
    });
  },

  teardown() {
    run(() => {
      App.destroy();
    });
  }
});

QUnit.test('Topmost template always get an element', function() {
  resolver.addTemplate('application', 'hello world');
  appInstance.lookup('router:main');
  run(App, 'advanceReadiness');

  equal(jQuery('#qunit-fixture > .ember-view').text(), 'hello world');
});
