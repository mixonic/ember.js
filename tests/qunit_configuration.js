(function() {
  window.EmberDev = window.EmberDev || {};

  // hack qunit to not suck for Ember objects
  var originalTypeof = QUnit.jsDump.typeOf;

  QUnit.jsDump.typeOf = function(obj) {
    if (Ember && Ember.Object && Ember.Object.detectInstance(obj)) {
      return "emberObject";
    }

    return originalTypeof.call(this, obj);
  };

  // raises is deprecated, but we likely want to keep it around for our es3
  // test runs.
  QUnit.constructor.prototype.raises = QUnit['throws'];
  window.raises = QUnit['throws'];

  QUnit.jsDump.parsers.emberObject = function(obj) {
    return obj.toString();
  };

  EmberDev.runningProdBuild = !!QUnit.urlParams.prod;

  var originalModule = QUnit.module;
  var testHelper = new EmberDevTestHelper(Ember, EmberDev.runningProdBuild);
  QUnit.module = function(name, origOpts) {
    var opts = {};
    opts.setup = function() {
      if (origOpts && origOpts.setup) {
        origOpts.setup();
      }
      testHelper.inject(); // Could happen at the start of the suite?
      testHelper.reset();
    }
    opts.teardown = function() {
      if (origOpts && origOpts.teardown) { origOpts.teardown(); }

      if (Ember && Ember.run) {
        if (Ember.run.currentRunLoop) {
          ok(false, "Should not be in a run loop at end of test");
          while (Ember.run.currentRunLoop) {
            Ember.run.end();
          }
        }
        if (Ember.run.hasScheduledTimers()) {
          // Use `ok` so we get full description.
          // Gate inside of `if` so that we don't mess up `expects` counts
          ok(false, "Ember run should not have scheduled timers at end of test");
          Ember.run.cancelTimers();
        }
      }

      testHelper = new EmberDevTestHelper(Ember, EmberDev.runningProdBuild);
      testHelper.assert();
      testHelper.restore(); // Could happen at the end of the suite?
    };
    return originalModule(name, opts);
  };

  // Tests should time out after 5 seconds
  QUnit.config.testTimeout = 5000;

  // Hide passed tests by default
  QUnit.config.hidepassed = true;

  // Handle testing feature flags
  QUnit.config.urlConfig.push({ id: 'enableoptionalfeatures', label: "Enable Opt Features"});

  // Handle extending prototypes
  QUnit.config.urlConfig.push({ id: 'extendprototypes', label: 'Extend Prototypes'});

  // Raise on unhandled deprecation
  QUnit.config.urlConfig.push({ id: 'raiseonunhandleddeprecation', label: 'Raise on Deprecation'});

  // Handle JSHint
  QUnit.config.urlConfig.push('nojshint');

  EmberDev.jsHint = !QUnit.urlParams.nojshint;
})();
