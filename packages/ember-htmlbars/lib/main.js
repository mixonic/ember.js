import { content, element, subexpr, lookupHelper } from "ember-htmlbars/hooks";
import { DOMHelper } from "morph";

import { bindHelper } from "ember-htmlbars/helpers";
import { viewHelper } from "ember-htmlbars/helpers/view";
import { yieldHelper } from "ember-htmlbars/helpers/yield";

export var defaultEnv = {
  dom: new DOMHelper(),

  hooks: {
    content: content,
    element: element,
    subexpr: subexpr,
    lookupHelper: lookupHelper
  },

  helpers: {
    bindHelper: bindHelper,
    view: viewHelper,
    'yield': yieldHelper
  }
};

