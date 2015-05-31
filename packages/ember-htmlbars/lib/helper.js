import Object from "ember-runtime/system/object";

// Ember.Helper.extend({ compute(params, hash) {} });
var Helper = Object.extend({
  isHelper: true,
  recompute() {
    this._stream.notify();
  }
});

// Ember.Helper.build(function(params, hash) {});
Helper.reopenClass({
  isHelperFactory: true,
  build(helperFn) {
    return {
      isHelperInstance: true,
      compute: helperFn
    };
  }
});

export default Helper;
