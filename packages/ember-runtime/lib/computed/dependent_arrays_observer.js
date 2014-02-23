require('ember-metal/computed');
require('ember-runtime/mixins/array');

var e_get = Ember.get,
    guidFor = Ember.guidFor,
    addBeforeObserver = Ember.addBeforeObserver,
    removeBeforeObserver = Ember.removeBeforeObserver,
    addObserver = Ember.addObserver,
    removeObserver = Ember.removeObserver,
    forEach = Ember.EnumerableUtils.forEach;

function get(obj, key) {
  if (key === '@this') {
    return obj;
  }

  return e_get(obj, key);
}

/*
  Tracks changes to dependent arrays, as well as to properties of items in
  dependent arrays.

  @class DependentArraysObserver
*/
function DependentArraysObserver(callbacks, cp, instanceMeta, context, propertyName, sugarMeta) {
  // user specified callbacks for `addedItem` and `removedItem`
  this.callbacks = callbacks;

  // the computed property: remember these are shared across instances
  this.cp = cp;

  // the ReduceComputedPropertyInstanceMeta this DependentArraysObserver is
  // associated with
  this.instanceMeta = instanceMeta;

  // A map of array guids to dependentKeys, for the given context.  We track
  // this because we want to set up the computed property potentially before the
  // dependent array even exists, but when the array observer fires, we lack
  // enough context to know what to update: we can recover that context by
  // getting the dependentKey.
  this.dependentKeysByGuid = {};

  // a map of dependent array guids -> Ember.TrackedArray instances.  We use
  // this to lazily recompute indexes for item property observers.
  this.trackedArraysByGuid = {};

  // We suspend observers to ignore replacements from `reset` when totally
  // recomputing.  Unfortunately we cannot properly suspend the observers
  // because we only have the key; instead we make the observers no-ops
  this.suspended = false;

  // This is used to coalesce item changes from property observers.
  this.changedItems = {};
}

function ItemPropertyObserverContext (dependentArray, index, trackedArray) {
  Ember.assert("Internal error: trackedArray is null or undefined", trackedArray);

  this.dependentArray = dependentArray;
  this.index = index;
  this.item = dependentArray.objectAt(index);
  this.trackedArray = trackedArray;
  this.beforeObserver = null;
  this.observer = null;

  this.destroyed = false;
}

DependentArraysObserver.prototype = {
  setValue: function (newValue) {
    this.instanceMeta.setValue(newValue, true);
  },
  getValue: function () {
    return this.instanceMeta.getValue();
  },

  setupObservers: function (dependentArray, dependentKey) {
    this.dependentKeysByGuid[guidFor(dependentArray)] = dependentKey;

    dependentArray.addArrayObserver(this, {
      willChange: 'dependentArrayWillChange',
      didChange: 'dependentArrayDidChange'
    });

    if (this.cp._itemPropertyKeys[dependentKey]) {
      this.setupPropertyObservers(dependentKey, this.cp._itemPropertyKeys[dependentKey]);
    }
  },

  teardownObservers: function (dependentArray, dependentKey) {
    var itemPropertyKeys = this.cp._itemPropertyKeys[dependentKey] || [];

    delete this.dependentKeysByGuid[guidFor(dependentArray)];

    this.teardownPropertyObservers(dependentKey, itemPropertyKeys);

    dependentArray.removeArrayObserver(this, {
      willChange: 'dependentArrayWillChange',
      didChange: 'dependentArrayDidChange'
    });
  },

  suspendArrayObservers: function (callback, binding) {
    var oldSuspended = this.suspended;
    this.suspended = true;
    callback.call(binding);
    this.suspended = oldSuspended;
  },

  setupPropertyObservers: function (dependentKey, itemPropertyKeys) {
    var dependentArray = get(this.instanceMeta.context, dependentKey),
        length = get(dependentArray, 'length'),
        observerContexts = new Array(length);

    this.resetTransformations(dependentKey, observerContexts);

    forEach(dependentArray, function (item, index) {
      var observerContext = this.createPropertyObserverContext(dependentArray, index, this.trackedArraysByGuid[dependentKey]);
      observerContexts[index] = observerContext;

      forEach(itemPropertyKeys, function (propertyKey) {
        addBeforeObserver(item, propertyKey, this, observerContext.beforeObserver);
        addObserver(item, propertyKey, this, observerContext.observer);
      }, this);
    }, this);
  },

  teardownPropertyObservers: function (dependentKey, itemPropertyKeys) {
    var dependentArrayObserver = this,
        trackedArray = this.trackedArraysByGuid[dependentKey],
        beforeObserver,
        observer,
        item;

    if (!trackedArray) { return; }

    trackedArray.apply(function (observerContexts, offset, operation) {
      if (operation === Ember.TrackedArray.DELETE) { return; }

      forEach(observerContexts, function (observerContext) {
        observerContext.destroyed = true;
        beforeObserver = observerContext.beforeObserver;
        observer = observerContext.observer;
        item = observerContext.item;

        forEach(itemPropertyKeys, function (propertyKey) {
          removeBeforeObserver(item, propertyKey, dependentArrayObserver, beforeObserver);
          removeObserver(item, propertyKey, dependentArrayObserver, observer);
        });
      });
    });
  },

  createPropertyObserverContext: function (dependentArray, index, trackedArray) {
    var observerContext = new ItemPropertyObserverContext(dependentArray, index, trackedArray);

    this.createPropertyObserver(observerContext);

    return observerContext;
  },

  createPropertyObserver: function (observerContext) {
    var dependentArrayObserver = this;

    observerContext.beforeObserver = function (obj, keyName) {
      return dependentArrayObserver.itemPropertyWillChange(obj, keyName, observerContext.dependentArray, observerContext);
    };
    observerContext.observer = function (obj, keyName) {
      return dependentArrayObserver.itemPropertyDidChange(obj, keyName, observerContext.dependentArray, observerContext);
    };
  },

  resetTransformations: function (dependentKey, observerContexts) {
    this.trackedArraysByGuid[dependentKey] = new Ember.TrackedArray(observerContexts);
  },

  trackAdd: function (dependentKey, index, newItems) {
    var trackedArray = this.trackedArraysByGuid[dependentKey];
    if (trackedArray) {
      trackedArray.addItems(index, newItems);
    }
  },

  trackRemove: function (dependentKey, index, removedCount) {
    var trackedArray = this.trackedArraysByGuid[dependentKey];

    if (trackedArray) {
      return trackedArray.removeItems(index, removedCount);
    }

    return [];
  },

  updateIndexes: function (trackedArray, array) {
    var length = get(array, 'length');
    // OPTIMIZE: we could stop updating once we hit the object whose observer
    // fired; ie partially apply the transformations
    trackedArray.apply(function (observerContexts, offset, operation) {
      // we don't even have observer contexts for removed items, even if we did,
      // they no longer have any index in the array
      if (operation === Ember.TrackedArray.DELETE) { return; }
      if (operation === Ember.TrackedArray.RETAIN && observerContexts.length === length && offset === 0) {
        // If we update many items we don't want to walk the array each time: we
        // only need to update the indexes at most once per run loop.
        return;
      }

      forEach(observerContexts, function (context, index) {
        context.index = index + offset;
      });
    });
  },

  dependentArrayWillChange: function (dependentArray, index, removedCount, addedCount) {
    if (this.suspended) { return; }

    var removedItem = this.callbacks.removedItem,
        changeMeta,
        guid = guidFor(dependentArray),
        dependentKey = this.dependentKeysByGuid[guid],
        itemPropertyKeys = this.cp._itemPropertyKeys[dependentKey] || [],
        length = get(dependentArray, 'length'),
        normalizedIndex = normalizeIndex(index, length, 0),
        normalizedRemoveCount = normalizeRemoveCount(normalizedIndex, length, removedCount),
        item,
        itemIndex,
        sliceIndex,
        observerContexts;

    observerContexts = this.trackRemove(dependentKey, normalizedIndex, normalizedRemoveCount);

    function removeObservers(propertyKey) {
      observerContexts[sliceIndex].destroyed = true;
      removeBeforeObserver(item, propertyKey, this, observerContexts[sliceIndex].beforeObserver);
      removeObserver(item, propertyKey, this, observerContexts[sliceIndex].observer);
    }

    for (sliceIndex = normalizedRemoveCount - 1; sliceIndex >= 0; --sliceIndex) {
      itemIndex = normalizedIndex + sliceIndex;
      if (itemIndex >= length) { break; }

      item = dependentArray.objectAt(itemIndex);

      forEach(itemPropertyKeys, removeObservers, this);

      changeMeta = createChangeMeta(dependentArray, item, itemIndex, this.instanceMeta.propertyName, this.cp);
      this.setValue( removedItem.call(
        this.instanceMeta.context, this.getValue(), item, changeMeta, this.instanceMeta.sugarMeta));
    }
  },

  dependentArrayDidChange: function (dependentArray, index, removedCount, addedCount) {
    if (this.suspended) { return; }

    var addedItem = this.callbacks.addedItem,
        guid = guidFor(dependentArray),
        dependentKey = this.dependentKeysByGuid[guid],
        observerContexts = new Array(addedCount),
        itemPropertyKeys = this.cp._itemPropertyKeys[dependentKey],
        length = get(dependentArray, 'length'),
        normalizedIndex = normalizeIndex(index, length, addedCount),
        changeMeta,
        observerContext;

    forEach(dependentArray.slice(normalizedIndex, normalizedIndex + addedCount), function (item, sliceIndex) {
      if (itemPropertyKeys) {
        observerContext =
          observerContexts[sliceIndex] =
          this.createPropertyObserverContext(dependentArray, normalizedIndex + sliceIndex, this.trackedArraysByGuid[dependentKey]);
        forEach(itemPropertyKeys, function (propertyKey) {
          addBeforeObserver(item, propertyKey, this, observerContext.beforeObserver);
          addObserver(item, propertyKey, this, observerContext.observer);
        }, this);
      }

      changeMeta = createChangeMeta(dependentArray, item, normalizedIndex + sliceIndex, this.instanceMeta.propertyName, this.cp);
      this.setValue( addedItem.call(
        this.instanceMeta.context, this.getValue(), item, changeMeta, this.instanceMeta.sugarMeta));
    }, this);

    this.trackAdd(dependentKey, normalizedIndex, observerContexts);
  },

  itemPropertyWillChange: function (obj, keyName, array, observerContext) {
    var guid = guidFor(obj);

    if (!this.changedItems[guid]) {
      this.changedItems[guid] = {
        array:            array,
        observerContext:  observerContext,
        obj:              obj,
        previousValues:   {}
      };
    }

    this.changedItems[guid].previousValues[keyName] = get(obj, keyName);
  },

  itemPropertyDidChange: function(obj, keyName, array, observerContext) {
    this.flushChanges();
  },

  flushChanges: function() {
    var changedItems = this.changedItems, key, c, changeMeta;

    for (key in changedItems) {
      c = changedItems[key];
      if (c.observerContext.destroyed) { continue; }

      this.updateIndexes(c.observerContext.trackedArray, c.observerContext.dependentArray);

      changeMeta = createChangeMeta(c.array, c.obj, c.observerContext.index, this.instanceMeta.propertyName, this.cp, c.previousValues);
      this.setValue(
        this.callbacks.removedItem.call(this.instanceMeta.context, this.getValue(), c.obj, changeMeta, this.instanceMeta.sugarMeta));
      this.setValue(
        this.callbacks.addedItem.call(this.instanceMeta.context, this.getValue(), c.obj, changeMeta, this.instanceMeta.sugarMeta));
    }
    this.changedItems = {};
  }
};

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

Ember.DependentArraysObserver = DependentArraysObserver;
