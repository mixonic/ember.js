import EmberView from "ember-views/views/view";
import { ViewHelper } from "ember-handlebars/helpers/view";
import { readViewFactory } from "ember-views/streams/read";

function buildViewAttributes(hash) {
}

function buildView(options) {
}

export function viewHelper(params, options, env) {
  debugger;
  // 1. streamify params/hash
  // 2. "ViewHelper.helper"
  // 3. 
  var types = options.types;
  var parentView = env.data.view;
  var container = parentView.container || parentView._keywords.view.value().container;
  var viewClass;

  // If no path is provided, treat path param as options
  // and get an instance of the registered `view:toplevel`
  if (params.length > 1) {
    if (container) {
      viewClass = container.lookupFactory('view:toplevel');
    } else {
      viewClass = EmberView;
    }
  } else {
    /*
    var pathStream;
    if (typeof path === 'string' && types[0] === 'ID') {
      pathStream = view.getStream(path);
      Ember.deprecate('Resolved the view "'+path+'" on the global context. Pass a view name to be looked up on the container instead, such as {{view "select"}}. http://emberjs.com/guides/deprecations#toc_global-lookup-of-views', !pathStream.isGlobal());
    } else {
      pathStream = path;
    }
    */

    viewClass = readViewFactory(params[0], container);
  }
  
  // streamifyHash(options.hash);
  // var attrs = buildViewAttrs(options.hash);
  // var view = buildView(path);
  // parentView.appendChild(view, attrs);


  options.helperName = options.helperName || 'view';

  return ViewHelper.helper(this, viewClass, options);
}
