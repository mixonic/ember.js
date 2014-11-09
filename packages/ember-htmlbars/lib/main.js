import { content, element, subexpr, lookupHelper } from "ember-htmlbars/hooks";
import { DOMHelper } from "morph";

import {
  registerHelper,
  default as helpers
} from "ember-htmlbars/helpers";

import yieldHelper from "ember-htmlbars/helpers/yield";
import viewHelper from "ember-htmlbars/helpers/view";
import bindHelper from "ember-htmlbars/helpers/bind";

registerHelper('yield', yieldHelper);
registerHelper('view', viewHelper);
registerHelper('bind', bindHelper);

export var defaultEnv = {
  dom: new DOMHelper(),

  hooks: {
    content: content,
    element: element,
    subexpr: subexpr,
    lookupHelper: lookupHelper
  },

  helpers: helpers
};

