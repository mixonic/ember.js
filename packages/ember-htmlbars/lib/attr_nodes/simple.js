/**
@module ember
@submodule ember-htmlbars
*/

import run from "ember-metal/run_loop";

function SimpleAttrNode() {
  // abstract class
} 

SimpleAttrNode.prototype.init = function init(element, attrName, simpleAttrValue, dom){
  this.element = element;
  this.attrName = attrName;
  this.attrValue = simpleAttrValue;
  this.dom = dom;
  this.isDirty = false;
  this.lastValue = null;
  this.currentValue = null;

  if (this.attrValue.isStream) {
    this.attrValue.subscribe(this.renderIfNeeded, this);
    this.renderIfNeeded();
  } else {
    this.currentValue = simpleAttrValue;
    this.render();
  }
};

SimpleAttrNode.prototype.reset = function reset(){
  this.attrValue.unsubscribe(this.renderIfNeeded, this);
  this.isDirty = false;
};

SimpleAttrNode.prototype.renderIfNeeded = function renderIfNeeded(){
  this.isDirty = true;
  run.schedule('render', this, this.scheduledRenderIfNeeded);
};

SimpleAttrNode.prototype.scheduledRenderIfNeeded = function scheduledRenderIfNeeded(){
  if (this.isDirty) {
    this.isDirty = false;
    var value = this.attrValue.value();
    if (value !== this.currentValue) {
      this.lastValue = this.currentValue;
      this.currentValue = value;
      this.render();
    }
  }
};

SimpleAttrNode.prototype.render = function render(){
  this.dom.setProperty(this.element, this.attrName, this.currentValue);
};

export default SimpleAttrNode;
