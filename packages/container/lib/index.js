/*
Public API for the container is still in flux.
The public API, specified on the application namespace should be considered the stable API.
// @module container
  @private
*/

import { isFeatureEnabled } from 'ember-metal';

import { default as EmberRegistry, privatize } from './registry';
import {
  default as EmberContainer,
  buildFakeContainerWithDeprecations,
  FACTORY_FOR as EMBER_FACTORY_FOR,
  LOOKUP_FACTORY
} from './container';

import { Registry as GlimmerRegistry } from '@glimmer/di';
import { Container as GlimmerContainer } from '@glimmer/di';

class EmberGlimmerRegistry extends GlimmerRegistry {
  /*
   * This is not strictly accurate, optionsForType stomped options.
   */
  optionsForType(name, options) {
    for (let key in options) {
      this.registerOption(name, key, options[key]);
    }
  }
  injection(type, property, fullName) {
    this.registerInjection(type, property, fullName);
  }
}

const Registry = isFeatureEnabled('glimmer-di') ? EmberGlimmerRegistry : EmberRegistry;
const Container = isFeatureEnabled('glimmer-di') ? GlimmerContainer : EmberContainer;
const FACTORY_FOR = isFeatureEnabled('glimmer-di') ? 'factoryFor' : EMBER_FACTORY_FOR;

export {
  Registry,
  Container,
  FACTORY_FOR
};

export {
  privatize,
  buildFakeContainerWithDeprecations,
  LOOKUP_FACTORY
};
