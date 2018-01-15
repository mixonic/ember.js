import { Controller } from 'ember-runtime';
import { moduleFor, ApplicationTestCase } from 'internal-test-helpers';
import { inject, Service } from 'ember-runtime';

moduleFor('Service Injection', class extends ApplicationTestCase {

  ['@test Service can be injected and is resolved'](assert) {
    this.add('controller:application', Controller.extend({
      myService: inject.service('my-service')
    }));
    let MyService = Service.extend();
    this.add('service:my-service', MyService);
    this.addTemplate('application', '');

    this.visit('/').then(() => {
      let controller = this.applicationInstance.lookup('controller:application');
      assert.ok(controller.get('myService') instanceof MyService);
    });
  }

  // Pending implementation
  ['@skip Service with namespace can be injected and is resolved'](assert) {
    this.add('controller:application', Controller.extend({
      myService: inject.service('my-namespace::my-service')
    }));
    let MyService = Service.extend();
    this.add({
      specifier: 'service',
      rawString: 'my-namespace::my-service'
    }, MyService);

    this.visit('/').then(() => {
      let controller = this.applicationInstance.lookup('controller:application');
      assert.ok(controller.get('myService') instanceof MyService);
    });
  }

});
