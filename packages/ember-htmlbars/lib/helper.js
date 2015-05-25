import Object from "ember-runtime/system/object";
import merge from "ember-metal/merge";
import Stream from "ember-metal/streams/stream";
import create from "ember-metal/platform/create";

function HelperStream(helper, params, hash,label) {
  this.init(label);
  this.helper = helper;
  this.params = params;
  this.hash = hash;
}

HelperStream.prototype = create(Stream.prototype);

merge(HelperStream.prototype, {
  compute() {
    return this.helper.compute(this.params, this.hash);
  }
});

var Helper = Object.extend({
  isHelper: true,
  recompute() {
    this._stream.notify();
  },
  getStream(params, hash) {
    this._stream = new HelperStream(this, params, hash);
    return this._stream;
  },
});

Helper.reopenClass({
  isHelperFactory: true,
  build(helperFn) {
    return {
      isHelperFactory: true,
      create() {
        return {
          isHelper: true,
          getStream(params, hash) {
            return new HelperStream(this, params, hash);
          },
          compute: helperFn
        };
      }
    };
  }
});

export default Helper;
