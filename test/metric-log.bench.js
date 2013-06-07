var metric = require("..");

var ITERATIONS = 1000000;

describe("metric-log-benchmarks", function(){

  var start, suite;

  beforeEach(function() {
    start = Date.now();
  });

  afterEach(function() {
    console.error(suite, "\n\t", ITERATIONS/((Date.now() - start)/1000), "metrics/sec");
  });

  it("metric(measure, value)", function() {
    suite = "metric(measure, value)";
    for (var i = 0; i < ITERATIONS; i++) {
      metric("request", 1);
    };
  });

  it("metric(measure, value, units)", function() {
    suite = "metric(measure, value, units)";
    for (var i = 0; i < ITERATIONS; i++) {
      metric("response_time", 30, "ms");
    };
  });

  it("metric(obj)", function() {
    suite = "metric(obj)";
    for (var i = 0; i < ITERATIONS; i++) {
      metric({testing: 123, hello: "world"});
    };
  });

  it("metric(deepObj)", function() {
    suite = "metric(deepObj)";
    for (var i = 0; i < ITERATIONS; i++) {
      metric({testing: 123, hello: "world", deep: {test: 456}});
    };
  });

  describe("metric.context", function(){
  
    var context = metric.context({host: "my.host.com"});

    it("context(measure, value)", function() {
      suite = "context(measure, value)";
      for (var i = 0; i < ITERATIONS; i++) {
        context("request", 1);
      };
    });

    it("context(measure, value, units)", function() {
      suite = "context(measure, value, units)";
      for (var i = 0; i < ITERATIONS; i++) {
        context("response_time", 30, "ms");
      };
    });

    it("context(obj)", function() {
      suite = "context(obj)";
      for (var i = 0; i < ITERATIONS; i++) {
        context({testing: 123, hello: "world"});
      };
    });

    it("context(deepObj)", function() {
      suite = "context(deepObj)";
      for (var i = 0; i < ITERATIONS; i++) {
        context({testing: 123, hello: "world", deep: {test: 456}});
      };
    });
  });

});
