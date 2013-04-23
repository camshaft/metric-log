var metric = require("..")
  , should = require("should");

describe("metric-log", function(){

  var log, str;

  before(function() {
    // Don't print to stdout
    metric.log = function(fmt) {
      str = fmt;
    };
  });

  afterEach(function() {
    str = "";
  });

  describe("metric(metric, value)", function(){
    it("should work", function() {
      metric("request", 1);
      str.should.eql("measure=request val=1");
    });

    it('should surround \' \' with "', function() {
      metric("request", "this is a test");
      str.should.eql('measure=request val="this is a test"');
    });

    it('should escape "', function() {
      metric("request", 'this is a "test"');
      str.should.eql('measure=request val="this is a \\\"test\\\""');
    });

    it('should not print blank values', function() {
      metric("request", '');
      str.should.eql('measure=request');
    });
  });

  describe("metric(metric, value, units)", function(){
    it("should work", function() {
      metric("response_time", 1, "ms");
      str.should.eql("measure=response_time val=1 units=ms");
    });
  });

  describe("metric(metric, value, units, props)", function(){
    it("should work", function() {
      metric("response_time", 1, "ms", {testing: 123});
      str.should.eql("measure=response_time val=1 units=ms testing=123");
    });
  });

  describe("metric(obj)", function(){
    it("should work", function() {
      metric({testing: 123, hello: "world"});
      str.should.eql("testing=123 hello=world");
    });
  });

  describe("metric(deepObj)", function(){
    it("should work", function() {
      metric({testing: 123, hello: "world", deep: {test: 456}});
      str.should.eql('testing=123 hello=world deep="{\\\"test\\\":456}"');
    });
  });

  describe("metric.profile()", function() {
    it("should return a callable function to profile", function(done) {
      var profile = metric.profile("testing123");
      setTimeout(function() {
        profile({test:123});

        str.should.match(/test=123/);
        str.should.match(/measure=testing123/);

        done();
      }, 50);
    });
  });

  describe("context(obj)", function(){

    var context;

    beforeEach(function() {
      context = metric.context({host: "my.host.com"});
    });

    describe("context(metric, value)", function(){
      it("should work", function(){
        context("request", 1);
        str.should.eql("measure=request val=1 host=my.host.com");
      });

      it('should surround \' \' with "', function() {
        context("request", "this is a test");
        str.should.eql('measure=request val="this is a test" host=my.host.com');
      });

      it('should escape "', function() {
        context("request", 'this is a "test"');
        str.should.eql('measure=request val="this is a \\\"test\\\"" host=my.host.com');
      });
    });

    describe("context(metric, value, units)", function(){
      it("should work", function(){
        context("response_time", 1, "ms");
        str.should.eql("measure=response_time val=1 units=ms host=my.host.com");
      });
    });

    describe("context(metric, value, units, props)", function(){
      it("should work", function() {
        context("response_time", 1, "ms", {testing: 123});
        str.should.eql("measure=response_time val=1 units=ms testing=123 host=my.host.com");
      });
    });

    describe("context(obj)", function(){
      it("should work", function() {
        context({testing: 123, hello: "world"});
        str.should.eql("testing=123 hello=world host=my.host.com");
      });
    });

    describe("context(deepObj)", function(){
      it("should work", function() {
        context({testing: 123, hello: "world", deep: {test: 456}});
        str.should.eql('testing=123 hello=world deep="{\\\"test\\\":456}" host=my.host.com');
      });
    });

    describe("context.profile(id)", function(){
      it("should profile a function call", function(done) {
        var end = context.profile('my-api-test-call');
        setTimeout(function() {
          end();
          str.should.match(/measure=my-api-test-call/);
          str.should.match(/val=[0-9]+/);
          done();
        }, 50);
      });
    });

    describe("context.profile(id, obj)", function(){
      it("should profile a function call and merge some properties", function(done) {
        var end = context.profile('my-api-test-call');
        setTimeout(function() {
          end({at:"info", lib:"my-lib"});
          str.should.match(/measure=my-api-test-call/);
          str.should.match(/val=[0-9]+/);
          str.should.match(/at=info/);
          str.should.match(/lib=my-lib/);
          done();
        }, 55);
      });
    });

    describe("context(obj).debug()", function(){
      it("should filter logs", function() {
        var child = context.extend({fn: "metric-log.test", at: "debug"}).debug();
        child({test: 123});
        str.should.eql("");
      });
    });

    describe("context().use(parent)", function(){
      it("should inherit context from a parent", function() {
        var request1Context = metric.context({request_id:1}).use(context)
          , request2Context = metric.context({request_id:2}).use(context)
          , request3Context = metric.context({request_id:3}).use({host: "my.other.host.com"});

        request1Context({test:"foo"});
        str.should.eql("test=foo request_id=1 host=my.host.com");

        request2Context({test:"bar"});
        str.should.eql("test=bar request_id=2 host=my.host.com");

        request3Context({test:"baz"});
        str.should.eql("test=baz request_id=3 host=my.other.host.com");
      });


      it("should inherit recursively", function(){
        var level1 = metric.context({level:1, level1: true}).use(context)
          , level2 = metric.context({level:2, level2: true}).use(level1)
          , level3 = metric.context({level:3, level3: true}).use(level2);

        context({test:"foo"});
        str.should.eql("test=foo host=my.host.com");

        level1({test:"foo"});
        str.should.eql("test=foo level=1 level1=true host=my.host.com");

        level2({test:"foo"});
        str.should.eql("test=foo level=2 level2=true level1=true host=my.host.com");

        level3({test:"foo"});
        str.should.eql("test=foo level=3 level3=true level2=true level1=true host=my.host.com");
      });
    });

    describe("context().context(obj)", function(){
      it("should create a new context that uses the current as a base", function() {
        var newContext = context.context({testing:123});

        newContext({hello: 123});
        str.should.eql("hello=123 testing=123 host=my.host.com");
      });
    });

    describe("concurrent profile", function() {
      it("should handle concurrent profile calls", function(done) {
        var call1 = context.profile('my-api-test-call')
          , call2 = context.profile('my-api-test-call');

        setTimeout(function() {
          call2({callId:2});
          str.should.match(/measure=my-api-test-call/);
          str.should.match(/callId=2/);

          call1({callId:1});
          str.should.match(/measure=my-api-test-call/);
          str.should.match(/callId=1/);
          done();
        }, 50);
      });

    });

  });

});
