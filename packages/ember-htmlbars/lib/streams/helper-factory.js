import Stream from "ember-metal/streams/stream";
import create from "ember-metal/platform/create";
import merge from "ember-metal/merge";
import {
  getArrayValues,
  getHashValues
} from "ember-htmlbars/streams/utils";

export default function HelperFactoryStream(helperFactory, params, hash, label) {
  this.init(label);
  this.helperFactory = helperFactory;
  this.params = params;
  this.hash = hash;
}

HelperFactoryStream.prototype = create(Stream.prototype);

merge(HelperFactoryStream.prototype, {
  compute() {
    if (!this.helper) {
      this.helper = this.helperFactory.create({ _stream: this });
    }
    return this.helper.compute(getArrayValues(this.params), getHashValues(this.hash));
  },
  destroy() {
    if (this.super$destroy(...arguments)) {
      if (this.helper.destroy) {
        this.helper.destroy();
      }
    }
  },
  super$destroy: Stream.prototype.destroy
});
