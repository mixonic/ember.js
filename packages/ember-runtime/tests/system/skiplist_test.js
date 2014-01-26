var skiplist;

module('Ember.SkipList', {
  setup: function () {
    skiplist = new Ember.SkipList(5);
  }
});

test("A single item added to a skiplist", function() {
  skiplist.add(5, "Five");
  equal(skiplist.find(5), "Five");
});

test("Several items added to a skiplist", function() {
  skiplist.add(5, "Five");
  skiplist.add(10, "Ten");
  skiplist.add(8, "Eight");
  equal(skiplist.find(5), "Five");
  equal(skiplist.find(10), "Ten");
  equal(skiplist.find(8), "Eight");
});

test("An item removed from a skiplist", function() {
  skiplist.add(5, "Five");
  skiplist.add(8, "Eight");
  equal(skiplist.find(5), "Five");
  equal(skiplist.find(8), "Eight");
  skiplist.remove(8);
  equal(skiplist.find(8), null);
  equal(skiplist.find(5), "Five");
});

test("An item not present removed from a skiplist", function() {
  try {
    skiplist.remove(8);
  } catch(e) {
    ok(true, "Error when removing something not there");
  }
});

test("An item present added to a skiplist", function() {
  skiplist.add(6, "Six");
  try {
    skiplist.add(6, "Six");
  } catch(e) {
    ok(true, "Error when adding something twice");
  }
});

