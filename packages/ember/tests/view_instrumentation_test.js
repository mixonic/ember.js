import {
  run,
  instrumentationSubscribe as subscribe,
  instrumentationReset as reset
} from 'ember-metal';
import { jQuery as $ } from 'ember-views';
import { Application } from 'ember-application';
import Resolver from 'internal-test-helpers/test-resolver';

let App, $fixture;

function setupExample(resolver) {
  // setup templates
  resolver.addTemplate('application', '{{outlet}}');
  resolver.addTemplate('index', '<h1>Index</h1>');
  resolver.addTemplate('posts', '<h1>Posts</h1>');

  App.Router.map(function() {
    this.route('posts');
  });
}

function handleURL(path) {
  let router = App.__container__.lookup('router:main');
  return run(router, 'handleURL', path);
}

QUnit.module('View Instrumentation', {
  setup() {
    run(() => {
      App = Application.create({
        rootElement: '#qunit-fixture',
        Resolver
      });
      App.deferReadiness();

      App.Router.reopen({
        location: 'none'
      });
    });

    $fixture = $('#qunit-fixture');
    setupExample(Resolver.lastInstance);
  },

  teardown() {
    reset();
    run(App, 'destroy');
    App = null;
  }
});

QUnit.test('Nodes without view instances are instrumented', function(assert) {
  let called = false;
  subscribe('render', {
    before() {
      called = true;
    },
    after() {}
  });
  run(App, 'advanceReadiness');
  assert.equal($fixture.text(), 'Index', 'It rendered the right template');
  assert.ok(called, 'Instrumentation called on first render');
  called = false;
  handleURL('/posts');
  assert.equal($fixture.text(), 'Posts', 'It rendered the right template');
  assert.ok(called, 'instrumentation called on transition to non-view backed route');
});
