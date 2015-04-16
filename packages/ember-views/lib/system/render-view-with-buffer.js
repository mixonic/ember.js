import defaultEnv from "ember-htmlbars/env";
import RenderBuffer from "ember-views/system/render_buffer";

export default function renderViewWithBuffer(view, domHelper) {
  var buffer = new RenderBuffer(domHelper);
  view.render(buffer);
  var env = {
    lifecycleHooks: [],
    view: view,
    outletState: view.outletState,
    container: view.container,
    renderer: view.renderer,
    dom: domHelper,
    hooks: defaultEnv.hooks,
    helpers: defaultEnv.helpers,
    useFragmentCache: false
  };

  view.env = env;
}
