import { Application } from 'ember-application';
import { Route, controllerFor } from 'ember-routing';
import { run } from 'ember-metal';
import { Component } from 'ember-glimmer';
import { jQuery } from 'ember-views';
import { compile } from 'ember-template-compiler';
import Resolver from 'internal-test-helpers/test-resolver';

let App, appInstance, resolver;

function setupApp(klass) {
  run(function() {
    App = klass.create({
      rootElement: '#qunit-fixture',
      Resolver
    });

    App.Router = App.Router.extend({
      location: 'none'
    });

    App.deferReadiness();

    appInstance = App.__deprecatedInstance__;

    resolver = Resolver.lastInstance;
  });
}

QUnit.module('Application Lifecycle', {
  setup() {
    setupApp(Application.extend());
  },

  teardown() {
    run(App, 'destroy');
  }
});

function handleURL(path) {
  let router = appInstance.lookup('router:main');
  return run(function() {
    return router.handleURL(path).then(function(value) {
      ok(true, 'url: `' + path + '` was handled');
      return value;
    }, function(reason) {
      ok(false, reason);
      throw reason;
    });
  });
}

QUnit.test('Resetting the application allows controller properties to be set when a route deactivates', function() {
  App.Router.map(function() {
    this.route('home', { path: '/' });
  });

  resolver.add('route:home', Route.extend({
    setupController() {
      this.controllerFor('home').set('selectedMenuItem', 'home');
    },
    deactivate() {
      this.controllerFor('home').set('selectedMenuItem', null);
    }
  }));
  resolver.add('route:application', Route.extend({
    setupController() {
      this.controllerFor('application').set('selectedMenuItem', 'home');
    },
    deactivate() {
      this.controllerFor('application').set('selectedMenuItem', null);
    }
  }));

  appInstance.lookup('router:main');

  run(App, 'advanceReadiness');

  handleURL('/');

  equal(controllerFor(appInstance, 'home').get('selectedMenuItem'), 'home');
  equal(controllerFor(appInstance, 'application').get('selectedMenuItem'), 'home');

  App.reset();

  equal(controllerFor(appInstance, 'home').get('selectedMenuItem'), null);
  equal(controllerFor(appInstance, 'application').get('selectedMenuItem'), null);
});

QUnit.test('Destroying the application resets the router before the appInstance is destroyed', function() {
  App.Router.map(function() {
    this.route('home', { path: '/' });
  });

  resolver.add('route:home', Route.extend({
    setupController() {
      this.controllerFor('home').set('selectedMenuItem', 'home');
    },
    deactivate() {
      this.controllerFor('home').set('selectedMenuItem', null);
    }
  }));
  resolver.add('route:application', Route.extend({
    setupController() {
      this.controllerFor('application').set('selectedMenuItem', 'home');
    },
    deactivate() {
      this.controllerFor('application').set('selectedMenuItem', null);
    }
  }));

  appInstance.lookup('router:main');

  run(App, 'advanceReadiness');

  handleURL('/');

  equal(controllerFor(appInstance, 'home').get('selectedMenuItem'), 'home');
  equal(controllerFor(appInstance, 'application').get('selectedMenuItem'), 'home');

  run(App, 'destroy');

  equal(controllerFor(appInstance, 'home').get('selectedMenuItem'), null);
  equal(controllerFor(appInstance, 'application').get('selectedMenuItem'), null);
});

QUnit.test('Destroying a route after the router does create an undestroyed `toplevelView`', function() {
  App.Router.map(function() {
    this.route('home', { path: '/' });
  });

  resolver.addTemplate('index', 'Index');
  resolver.addTemplate('application', 'Application! {{outlet}}');

  resolver.add('route:index', Route.extend());
  run(App, 'advanceReadiness');

  handleURL('/');

  let router = appInstance.lookup('router:main');
  let route = appInstance.lookup('route:index');

  run(router, 'destroy');
  equal(router._toplevelView, null, 'the toplevelView was cleared');

  run(route, 'destroy');
  equal(router._toplevelView, null, 'the toplevelView was not reinitialized');

  run(App, 'destroy');
  equal(router._toplevelView, null, 'the toplevelView was not reinitialized');
});

QUnit.test('initializers can augment an applications customEvents hash', function(assert) {
  assert.expect(1);

  run(App, 'destroy');

  let ApplicationSubclass = Application.extend();

  ApplicationSubclass.initializer({
    name: 'customize-things',
    initialize(application) {
      application.customEvents = {
        wowza: 'wowza'
      };
    }
  });

  setupApp(ApplicationSubclass);

  resolver.add('component:foo-bar', Component.extend({
    wowza() {
      assert.ok(true, 'fired the event!');
    }
  }));

  resolver.addTemplate('application', `{{foo-bar}}`);
  resolver.addTemplate('components/foo-bar', `<div id='wowza-thingy'></div>`);

  run(App, 'advanceReadiness');

  run(() => jQuery('#wowza-thingy').trigger('wowza'));
});

QUnit.test('instanceInitializers can augment the customEvents hash', function(assert) {
  assert.expect(1);

  run(App, 'destroy');

  let ApplicationSubclass = Application.extend();

  ApplicationSubclass.instanceInitializer({
    name: 'customize-things',
    initialize(application) {
      application.customEvents = {
        herky: 'jerky'
      };
    }
  });

  setupApp(ApplicationSubclass);

  resolver.add('component:foo-bar', Component.extend({
    jerky() {
      assert.ok(true, 'fired the event!');
    }
  }));

  resolver.addTemplate('application', `{{foo-bar}}`);
  resolver.addTemplate('components/foo-bar', `<div id='herky-thingy'></div>`);

  run(App, 'advanceReadiness');

  run(() => jQuery('#herky-thingy').trigger('herky'));
});
