var metric = require("..");

var ITERATIONS = 1000000;

describe("metric-log-benchmarks", function(){

  var log, start;

  beforeEach(function() {
    log = console.log;
    console.log = function() {};
    start = new Date;
  });

  afterEach(function() {
    console.log = log;
    console.log('', ITERATIONS/((new Date - start)/1000), "metrics/sec");
  });

  it("metric(measure, value)", function() {
    for (var i = 0; i < ITERATIONS; i++) {
      metric("request", 1);
    };
  });

  it("metric(measure, value, units)", function() {
    for (var i = 0; i < ITERATIONS; i++) {
      metric("response_time", 30, "ms");
    };
  });

  it("metric(obj)", function() {
    for (var i = 0; i < ITERATIONS; i++) {
      metric({testing: 123, hello: "world"});
    };
  });

  it("metric(deepObj)", function() {
    for (var i = 0; i < ITERATIONS; i++) {
      metric({testing: 123, hello: "world", deep: {test: 456}});
    };
  });

  it("metric.context(deepObj)", function() {
    for (var i = 0; i < ITERATIONS; i++) {
      metric({testing: 123, hello: "world", deep: {test: 456}});
    };
  });

  describe("metric.context", function(){
  
    var context = metric.context({host: "my.host.com"});

    it("context(measure, value)", function() {
      for (var i = 0; i < ITERATIONS; i++) {
        context("request", 1);
      };
    });

    it("context(measure, value, units)", function() {
      for (var i = 0; i < ITERATIONS; i++) {
        context("response_time", 30, "ms");
      };
    });

    it("context(obj)", function() {
      for (var i = 0; i < ITERATIONS; i++) {
        context({testing: 123, hello: "world"});
      };
    });

    it("context(deepObj)", function() {
      for (var i = 0; i < ITERATIONS; i++) {
        context({testing: 123, hello: "world", deep: {test: 456}});
      };
    });
  });

});
