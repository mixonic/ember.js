import { run } from 'ember-metal';
import { Application } from 'ember-application';
import { Router } from 'ember-routing';
import { jQuery } from 'ember-views';
import Resolver from 'internal-test-helpers/test-resolver';

let router, App, resolver;

function bootApplication() {
  run(App, 'advanceReadiness');
}

function handleURL(path) {
  return run(() => {
    return router.handleURL(path).then(function(value) {
      ok(true, 'url: `' + path + '` was handled');
      return value;
    }, function(reason) {
      ok(false, 'failed to visit:`' + path + '` reason: `' + QUnit.jsDump.parse(reason));
      throw reason;
    });
  });
}

QUnit.module('Router.map', {
  setup() {
    run(() => {
      App = Application.extend({
        name: 'App',
        rootElement: '#qunit-fixture',
        Resolver
      }).create();

      App.deferReadiness();

      App.Router.reopen({
        location: 'none'
      });

      App.instanceInitializer({
        name: 'fetchRouter',
        initialize(appInstance) {
          router = appInstance.lookup('router:main');
        }
      });

      resolver = Resolver.lastInstance;
    });
  },

  teardown() {
    run(() => {
      App.destroy();
      App = null;
    });
  }
});

QUnit.test('Router.map returns an Ember Router class', function () {
  expect(1);

  let ret = App.Router.map(function() {
    this.route('hello');
  });

  ok(Router.detect(ret));
});

QUnit.test('Router.map can be called multiple times', function () {
  expect(4);

  resolver.addTemplate('hello', 'Hello!');
  resolver.addTemplate('goodbye', 'Goodbye!');

  App.Router.map(function() {
    this.route('hello');
  });

  App.Router.map(function() {
    this.route('goodbye');
  });

  bootApplication();

  handleURL('/hello');

  equal(jQuery('#qunit-fixture').text(), 'Hello!', 'The hello template was rendered');

  handleURL('/goodbye');

  equal(jQuery('#qunit-fixture').text(), 'Goodbye!', 'The goodbye template was rendered');
});
