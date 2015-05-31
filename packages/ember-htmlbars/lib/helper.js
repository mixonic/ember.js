import Object from "ember-runtime/system/object";

var Helper = Object.extend({
  isHelper: true,
  recompute() {
    this._stream.notify();
  }
});

// Ember.Helper.build(function(params, hash) {
// });
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
