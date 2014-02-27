module('Ember.baseReduceComputed');

test("properties are instances of Ember.ComputedProperty", function() {
  ok(Ember.baseReduceComputed('dependentKey', {initialValue: 'foo'}) instanceof Ember.ComputedProperty);
});

test("raises if missing an initialValue", function() {
  try {
    Ember.baseReduceComputed('dependentKey', {});
  } catch(e) {
    ok(/declared without an initial value/.test(e.message), "Raised with error: "+e.message);
  }
});

test("properties read their initialValue read", function() {
  var obj = Ember.Object.createWithMixins({
    numbers: null,
    reduced: Ember.baseReduceComputed('numbers', {
      initialValue: 42
    })
  });
  equal(obj.get('reduced'), 42);
});

test("properties read their value after dependent key change", function() {
  var obj = Ember.Object.createWithMixins({
    numbers:  Ember.A([ 1, 2, 3, 4, 5, 6 ]),
    baseFirst: Ember.baseReduceComputed('numbers', {
      initialValue: null,
      addedItems: function(array, meta, sugar){
        return meta.arrayChanged[0];
      }
    })
  });
  obj.get('numbers').unshiftObject(37);
  equal(obj.get('baseFirst'), 37);
});

test("addedItems called once for three items", function() {
  var addedCount = 0;
  var obj = Ember.Object.createWithMixins({
    numbers: Ember.A([]),
    reduced: Ember.baseReduceComputed('numbers', {
      initialValue: null,
      addedItems: function(){
        addedCount++;
      }
    })
  });
  obj.get('numbers').pushObjects(Ember.A([37, 56, 92]));
  // baseReduceComputed is lazy, and so it not called until `get`
  equal(addedCount, 0, "Has not called addedItems");
  obj.get('reduced');
  equal(addedCount, 1, "Called addedItems");
});

test("removedItems called once for three items", function() {
  var removedCount = 0;
  var obj = Ember.Object.createWithMixins({
    numbers: Ember.A([1,2,3]),
    reduced: Ember.baseReduceComputed('numbers', {
      initialValue: null,
      removedItems: function(){
        removedCount++;
      }
    })
  });
  // Force initial computation
  obj.get('reduced');
  obj.get('numbers').removeAt(0, 3);
  // baseReduceComputed is lazy, and so it not called until `get`
  equal(removedCount, 0, "Has not called removedItems");
  obj.get('reduced');
  equal(removedCount, 1, "Called removedItems");
});
