import { moduleFor, RenderingTest } from '../../utils/test-case';
import { EMBER_MODULE_UNIFICATION } from 'ember/features';

if (EMBER_MODULE_UNIFICATION) {

  moduleFor('Namespaced lookup', class extends RenderingTest {
    ['@test it can render a namespaced component']() {
      this.addTemplate({
        specifier: 'template:components/',
        rawString: 'my-addon::my-component'
      }, 'namespaced template');

      this.addComponent('x-outer', { template: '{{my-addon::my-component}}' });

      this.render('{{x-outer}}');

      this.assertText('namespaced template');

      this.runTask(() => this.rerender());

      this.assertText('namespaced template');
    }

    ['@test it can render a nested namespaced component']() {
      this.addTemplate({
        specifier: 'template:components/',
        rawString: 'second-addon::my-component'
      }, 'second namespaced template');

      this.addTemplate({
        specifier: 'template:components/',
        rawString: 'first-addon::my-component'
      }, '{{second-addon::my-component}}');

      this.addComponent('x-outer', { template: '{{first-addon::my-component}}' });

      this.render('{{x-outer}}');

      this.assertText('second namespaced template');

      this.runTask(() => this.rerender());

      this.assertText('second namespaced template');
    }

    ['@test it can render a nested un-namespaced component']() {
      this.addTemplate({
        specifier: 'template:components/addon-component',
        referrer: 'template:/first-addon/src/ui/components/my-component'
      }, 'un-namespaced addon template');

      this.addTemplate({
        specifier: 'template:components/',
        // TODO: moduleNames really should have type, be specifiers.
        moduleName: '/first-addon/src/ui/components/my-component',
        rawString: 'first-addon::my-component'
      }, '{{addon-component}}');

      this.addComponent('x-outer', { template: '{{first-addon::my-component}}' });

      this.render('{{x-outer}}');

      this.assertText('un-namespaced addon template');

      this.runTask(() => this.rerender());

      this.assertText('un-namespaced addon template');
    }
  });

}
