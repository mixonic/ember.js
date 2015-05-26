import Object from "ember-runtime/system/object";

var Helper = Object.extend({
  isHelper: true,
  recompute() {
    this._stream.notify();
  }
});

Helper.reopenClass({
  isHelperFactory: true,
  build(helperFn) {
    return {
      isHelperFactory: true,
      create() {
        return {
          isHelper: true,
          compute: helperFn
        };
      }
    };
  }
});

export default Helper;
