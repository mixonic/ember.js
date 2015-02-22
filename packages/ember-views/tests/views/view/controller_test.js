import run from "ember-metal/run_loop";

import View from "ember-views/views/view";
import ContainerView from "ember-views/views/container_view";
import compile from "ember-template-compiler/system/compile";

QUnit.module("Ember.View - controller property");

test("controller property should be inherited from nearest ancestor with controller", function() {
  var grandparent = ContainerView.create();
  var parent = ContainerView.create();
  var child = ContainerView.create();
  var grandchild = ContainerView.create();

  var grandparentController = {};
  var parentController = {};

  run(function() {
    grandparent.set('controller', grandparentController);
    parent.set('controller', parentController);

    grandparent.pushObject(parent);
    parent.pushObject(child);
  });

  strictEqual(grandparent.get('controller'), grandparentController);
  strictEqual(parent.get('controller'), parentController);
  strictEqual(child.get('controller'), parentController);
  strictEqual(grandchild.get('controller'), null);

  run(function() {
    child.pushObject(grandchild);
  });

  strictEqual(grandchild.get('controller'), parentController);

  var newController = {};
  run(function() {
    parent.set('controller', newController);
  });

  strictEqual(parent.get('controller'), newController);
  strictEqual(child.get('controller'), newController);
  strictEqual(grandchild.get('controller'), newController);

  run(function() {
    grandparent.destroy();
    parent.destroy();
    child.destroy();
    grandchild.destroy();
  });
});

test("controller property changing should be compatible with child virtual views", function() {
  var child = View.create();
  var parent = ContainerView.createWithMixins({
    layout: compile('<div {{bind-attr baz="whut"}}></div>'),
    addChildView: function(){
      this.pushObject(this.createChildView(child));
    }
  });
  run(parent, 'appendTo', '#qunit-fixture');
  run(parent, 'addChildView');

  var newParentController = {};
  var parentController = {};

  run(function() {
    parent.set('controller', parentController);
  });

  strictEqual(parent.get('controller'), parentController, 'precond - parent has controller');
  strictEqual(child.get('controller'), parentController, 'precond - child has controller');

  run(function() {
    parent.set('controller', newParentController);
  });

  strictEqual(parent.get('controller'), newParentController, 'parent has new controller');
  strictEqual(child.get('controller'), newParentController, 'child has new controller');

  run(function() {
    parent.destroy();
    child.destroy();
  });
});
