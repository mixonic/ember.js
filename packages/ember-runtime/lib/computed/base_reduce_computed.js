
require('ember-metal/expand_properties');
require('ember-metal/computed');
require('ember-runtime/mixins/array');
require('ember-runtime/computed/dependent_arrays_observer');

var e_get = Ember.get,
    guidFor = Ember.guidFor,
    metaFor = Ember.meta,
    propertyWillChange = Ember.propertyWillChange,
    propertyDidChange = Ember.propertyDidChange,
    ComputedProperty = Ember.ComputedProperty,
    a_slice = [].slice,
    o_create = Ember.create,
    forEach = Ember.EnumerableUtils.forEach,
    expandProperties = Ember.expandProperties,
    // Here we explicitly don't allow `@each.foo`; it would require some special
    // testing, but there's no particular reason why it should be disallowed.
    eachPropertyPattern = /^(.*)\.@each\.(.*)/,
    doubleEachPropertyPattern = /(.*\.@each){2,}/,
    arrayBracketPattern = /\.\[\]$/,
    DependentArraysObserver = Ember.DependentArraysObserver;

function get(obj, key) {
  if (key === '@this') {
    return obj;
  }

  return e_get(obj, key);
}

function normalizeIndex(index, length, newItemsOffset) {
  if (index < 0) {
    return Math.max(0, length + index);
  } else if (index < length) {
    return index;
  } else /* index > length */ {
    return Math.min(length - newItemsOffset, index);
  }
}

function normalizeRemoveCount(index, length, removedCount) {
  return Math.min(removedCount, length - index);
}

function createChangeMeta(dependentArray, item, index, propertyName, property, previousValues) {
  var meta = {
    arrayChanged: dependentArray,
    index: index,
    item: item,
    propertyName: propertyName,
    property: property
  };

  if (previousValues) {
    // previous values only available for item property changes
    meta.previousValues = previousValues;
  }

  return meta;
}

function addItems(dependentArray, callbacks, cp, propertyName, meta) {
  meta.setValue( callbacks.addedItems.call(
    this, meta.getValue(), createChangeMeta(dependentArray, 0, propertyName, cp), meta.sugarMeta));
}

function reset(cp, propertyName) {
  var callbacks = cp._callbacks(),
      meta;

  if (cp._hasInstanceMeta(this, propertyName)) {
    meta = cp._instanceMeta(this, propertyName);
    meta.setValue(cp.resetValue(meta.getValue()));
  } else {
    meta = cp._instanceMeta(this, propertyName);
  }

  if (cp.options.initialize) {
    cp.options.initialize.call(this, meta.getValue(), { property: cp, propertyName: propertyName }, meta.sugarMeta);
  }
}

function partiallyRecomputeFor(obj, dependentKey) {
  if (arrayBracketPattern.test(dependentKey)) {
    return false;
  }

  var value = get(obj, dependentKey);
  return Ember.Array.detect(value);
}

function BaseReduceComputedPropertyInstanceMeta(context, propertyName, initialValue) {
  this.context = context;
  this.propertyName = propertyName;
  this.cache = metaFor(context).cache;

  this.dependentArrays = {};
  this.sugarMeta = {};

  this.initialValue = initialValue;
}

BaseReduceComputedPropertyInstanceMeta.prototype = {
  getValue: function () {
    if (this.propertyName in this.cache) {
      return this.cache[this.propertyName];
    } else {
      return this.initialValue;
    }
  },

  setValue: function(newValue, triggerObservers) {
    // This lets sugars force a recomputation, handy for very simple
    // implementations of eg max.
    if (newValue === this.cache[this.propertyName]) {
      return;
    }

    if (triggerObservers) {
      propertyWillChange(this.context, this.propertyName);
    }

    if (newValue === undefined) {
      delete this.cache[this.propertyName];
    } else {
      this.cache[this.propertyName] = newValue;
    }

    if (triggerObservers) {
      propertyDidChange(this.context, this.propertyName);
    }
  }
};

function BaseReduceComputedProperty(options) {
  var cp = this;

  this.options = options;
  this._instanceMetas = {};

  this._dependentKeys = null;
  // A map of dependentKey -> [itemProperty, ...] that tracks what properties of
  // items in the array we must track to update this property.
  this._itemPropertyKeys = {};
  this._previousItemPropertyKeys = {};

  this.readOnly();
  this.cacheable();

  this.recomputeOnce = function(propertyName) {
    // What we really want to do is coalesce by <cp, propertyName>.
    // We need a form of `scheduleOnce` that accepts an arbitrary token to
    // coalesce by, in addition to the target and method.
    Ember.run.once(this, recompute, propertyName);
  };
  var recompute = function(propertyName) {
    var dependentKeys = cp._dependentKeys,
        meta = cp._instanceMeta(this, propertyName),
        callbacks = cp._callbacks();

    reset.call(this, cp, propertyName);

    meta.dependentArraysObserver.suspendArrayObservers(function () {
      forEach(cp._dependentKeys, function (dependentKey) {
        Ember.assert(
          "dependent array " + dependentKey + " must be an `Ember.Array`.  " +
          "If you are not extending arrays, you will need to wrap native arrays with `Ember.A`",
          !(Ember.isArray(get(this, dependentKey)) && !Ember.Array.detect(get(this, dependentKey))));

        if (!partiallyRecomputeFor(this, dependentKey)) { return; }

        var dependentArray = get(this, dependentKey),
            previousDependentArray = meta.dependentArrays[dependentKey];

        if (dependentArray === previousDependentArray) {
          // The array may be the same, but our item property keys may have
          // changed, so we set them up again.  We can't easily tell if they've
          // changed: the array may be the same object, but with different
          // contents.
          if (cp._previousItemPropertyKeys[dependentKey]) {
            delete cp._previousItemPropertyKeys[dependentKey];
            meta.dependentArraysObserver.setupPropertyObservers(dependentKey, cp._itemPropertyKeys[dependentKey]);
          }
        } else {
          meta.dependentArrays[dependentKey] = dependentArray;

          if (previousDependentArray) {
            meta.dependentArraysObserver.teardownObservers(previousDependentArray, dependentKey);
          }

          if (dependentArray) {
            meta.dependentArraysObserver.setupObservers(dependentArray, dependentKey);
          }
        }
      }, this);
    }, this);

    forEach(cp._dependentKeys, function(dependentKey) {
      if (!partiallyRecomputeFor(this, dependentKey)) { return; }

      var dependentArray = get(this, dependentKey);
      if (dependentArray) {
        addItems.call(this, dependentArray, callbacks, cp, propertyName, meta);
      }
    }, this);
  };


  this.func = function (propertyName) {
    Ember.assert("Computed reduce values require at least one dependent key", cp._dependentKeys);

    recompute.call(this, propertyName);

    return cp._instanceMeta(this, propertyName).getValue();
  };
}

Ember.BaseReduceComputedProperty = BaseReduceComputedProperty;
BaseReduceComputedProperty.prototype = o_create(ComputedProperty.prototype);

function defaultCallback(computedValue) {
  return computedValue;
}

BaseReduceComputedProperty.prototype._callbacks = function () {
  if (!this.callbacks) {
    var options = this.options;
    this.callbacks = {
      removedItems: options.removedItems || defaultCallback,
      addedItems: options.addedItems || defaultCallback
    };
  }
  return this.callbacks;
};

BaseReduceComputedProperty.prototype._hasInstanceMeta = function (context, propertyName) {
  var guid = guidFor(context),
      key = guid + ':' + propertyName;

  return !!this._instanceMetas[key];
};

BaseReduceComputedProperty.prototype._instanceMeta = function (context, propertyName) {
  var guid = guidFor(context),
      key = guid + ':' + propertyName,
      meta = this._instanceMetas[key];

  if (!meta) {
    meta = this._instanceMetas[key] = new BaseReduceComputedPropertyInstanceMeta(context, propertyName, this.initialValue());
    meta.dependentArraysObserver = new DependentArraysObserver(this._callbacks(), this, meta, context, propertyName, meta.sugarMeta);
  }

  return meta;
};

BaseReduceComputedProperty.prototype.initialValue = function () {
  if (typeof this.options.initialValue === 'function') {
    return this.options.initialValue();
  }
  else {
    return this.options.initialValue;
  }
};

BaseReduceComputedProperty.prototype.resetValue = function (value) {
  return this.initialValue();
};

BaseReduceComputedProperty.prototype.itemPropertyKey = function (dependentArrayKey, itemPropertyKey) {
  this._itemPropertyKeys[dependentArrayKey] = this._itemPropertyKeys[dependentArrayKey] || [];
  this._itemPropertyKeys[dependentArrayKey].push(itemPropertyKey);
};

BaseReduceComputedProperty.prototype.clearItemPropertyKeys = function (dependentArrayKey) {
  if (this._itemPropertyKeys[dependentArrayKey]) {
    this._previousItemPropertyKeys[dependentArrayKey] = this._itemPropertyKeys[dependentArrayKey];
    this._itemPropertyKeys[dependentArrayKey] = [];
  }
};

BaseReduceComputedProperty.prototype.property = function () {
  var cp = this,
      args = a_slice.call(arguments),
      propertyArgs = new Ember.Set(),
      match,
      dependentArrayKey,
      itemPropertyKey;

  forEach(args, function (dependentKey) {
    if (doubleEachPropertyPattern.test(dependentKey)) {
      throw new Ember.Error("Nested @each properties not supported: " + dependentKey);
    } else if (match = eachPropertyPattern.exec(dependentKey)) {
      dependentArrayKey = match[1];

      var itemPropertyKeyPattern = match[2],
          addItemPropertyKey = function (itemPropertyKey) {
            cp.itemPropertyKey(dependentArrayKey, itemPropertyKey);
          };

      expandProperties(itemPropertyKeyPattern, addItemPropertyKey);
      propertyArgs.add(dependentArrayKey);
    } else {
      propertyArgs.add(dependentKey);
    }
  });

  return ComputedProperty.prototype.property.apply(this, propertyArgs.toArray());

};

Ember.baseReduceComputed = function (options) {
  var args;

  if (arguments.length > 1) {
    args = a_slice.call(arguments, 0, -1);
    options = a_slice.call(arguments, -1)[0];
  }

  if (typeof options !== "object") {
    throw new Ember.Error("Base Reduce Computed Property declared without an options hash");
  }

  if (!('initialValue' in options)) {
    throw new Ember.Error("Base Reduce Computed Property declared without an initial value");
  }

  var cp = new BaseReduceComputedProperty(options);

  if (args) {
    cp.property.apply(cp, args);
  }

  return cp;
};
