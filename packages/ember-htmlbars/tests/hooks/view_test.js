import EmberView from "ember-views/views/view";
import run from "ember-metal/run_loop";
import { compile } from "htmlbars-compiler/compiler";
import { equalInnerHTML } from "../helpers";

var view;

function appendView(view) {
  run(function() { view.appendTo('#qunit-fixture'); });
}

QUnit.module("ember-htmlbars: basic/view_test", {
  teardown: function(){
    if (view) {
      run(view, view.destroy);
    }
  }
});

test("property is output", function() {
  view = EmberView.create({
    context: {
      nameView: EmberView.extend({
        tagName: '',
        context: { fullName: "erik" },
        template: compile("{{fullName}}")
      })
    },
    template: compile("ohai {{view nameView}}")
  });
  appendView(view);

  equalInnerHTML(view.element, 'ohai erik', "property is output");
});
