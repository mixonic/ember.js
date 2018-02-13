import { getOwner } from 'ember-utils';
import { assert } from 'ember-debug';
import { ComputedProperty } from './computed';
import { AliasedProperty } from './alias';
import { Descriptor } from './properties';
import { descriptorFor } from './meta';

/**
 @module ember
 @private
 */

/**
  Read-only property that returns the result of a container lookup.

  @class InjectedProperty
  @namespace Ember
  @constructor
  @param {String} type The container type the property will lookup
  @param {String} name (optional) The name the property will lookup, defaults
         to the property's name
  @private
*/
export default function InjectedProperty(type, name, options) {
  this.type = type;
  this.name = name;
  this.source = options ? options.source : undefined;

  this._super$Constructor(injectedPropertyGet);
  AliasedPropertyPrototype.oneWay.call(this);
}

function injectedPropertyGet(keyName) {
  let desc = descriptorFor(this, keyName);
  let owner = getOwner(this) || this.container; // fallback to `container` for backwards compat

  assert(`InjectedProperties should be defined with the inject computed property macros.`, desc && desc.type);
  assert(`Attempting to lookup an injected property on an object without a container, ensure that the object was instantiated via a container.`, owner);

  let specifier = `${desc.type}:${desc.name || keyName}`;
  if (desc.source) {
    return owner.lookup(specifier, {source: desc.source});
  } else {
    return owner.lookup(specifier);
  }
}

InjectedProperty.prototype = Object.create(Descriptor.prototype);

const InjectedPropertyPrototype = InjectedProperty.prototype;
const ComputedPropertyPrototype = ComputedProperty.prototype;
const AliasedPropertyPrototype = AliasedProperty.prototype;

InjectedPropertyPrototype._super$Constructor = ComputedProperty;

InjectedPropertyPrototype.get = ComputedPropertyPrototype.get;
InjectedPropertyPrototype.readOnly = ComputedPropertyPrototype.readOnly;
InjectedPropertyPrototype.teardown = ComputedPropertyPrototype.teardown;
