var metric = require("..")
  , should = require("should");

describe("metric-log", function(){

  var log, str;

  beforeEach(function() {
    log = console.log;
    console.log = function(fmt) {
      str = fmt;
    };
  });

  afterEach(function() {
    console.log = log;
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
      str.should.eql('measure=request val="this is a \"test\""');
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
      str.should.eql('testing=123 hello=world deep="{\"test\":456}"');
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
        str.should.eql("host=my.host.com measure=request val=1");
      });

      it('should surround \' \' with "', function() {
        context("request", "this is a test");
        str.should.eql('host=my.host.com measure=request val="this is a test"');
      });

      it('should escape "', function() {
        context("request", 'this is a "test"');
        str.should.eql('host=my.host.com measure=request val="this is a \"test\""');
      });
    });

    describe("context(metric, value, units)", function(){
      it("should work", function(){
        context("response_time", 1, "ms");
        str.should.eql("host=my.host.com measure=response_time val=1 units=ms");
      });
    });

    describe("context(metric, value, units, props)", function(){
      it("should work", function() {
        context("response_time", 1, "ms", {testing: 123});
        str.should.eql("host=my.host.com measure=response_time val=1 units=ms testing=123");
      });
    });

    describe("context(obj)", function(){
      it("should work", function() {
        context({testing: 123, hello: "world"});
        str.should.eql("host=my.host.com testing=123 hello=world");
      });
    });

    describe("context(deepObj)", function(){
      it("should work", function() {
        context({testing: 123, hello: "world", deep: {test: 456}});
        str.should.eql('host=my.host.com testing=123 hello=world deep="{\"test\":456}"');
      });
    });

    describe("context.profileSafe(id)", function(){
      it("should allow interlieved profile calls with same id", function(done) {
        var call1 = context.profileSafe('my-api-test-call', {callId: 1}),
            call2 = context.profileSafe('my-api-test-call', {callId: 2});
        setTimeout(function() {
          context.profileSafe(call2);
          str.should.match(/measure=my-api-test-call/);
          str.should.match(/callId=2/);

          context.profileSafe(call1);
          str.should.match(/measure=my-api-test-call/);
          str.should.match(/callId=1/);
          done();
        }, 50);
      });
    });

    describe("context.profile(id)", function(){
      it("should profile a function call", function(done) {
        context.profile('my-api-test-call');
        setTimeout(function() {
          context.profile('my-api-test-call');
          str.should.match(/measure=my-api-test-call/);
          str.should.match(/val=5/);
          done();
        }, 50);
      });
    });

    describe("context.profile(id, obj)", function(){
      it("should profile a function call and merge some properties", function(done) {
        context.profile('my-api-test-call');
        setTimeout(function() {
          context.profile('my-api-test-call', {at:"info", lib:"my-lib"});
          str.should.match(/measure=my-api-test-call/);
          str.should.match(/val=5/);
          str.should.match(/at=info/);
          str.should.match(/lib=my-lib/);
          done();
        }, 55);
      });
    });

    describe("context().use(parent)", function(){
      it("should inherit context from a parent", function() {
        var request1Context = metric.context({request_id:1}).use(context)
          , request2Context = metric.context({request_id:2}).use(context)
          , request3Context = metric.context({request_id:3}).use({host: "my.other.host.com"});

        request1Context({test:"foo"});
        str.should.eql("host=my.host.com request_id=1 test=foo");

        request2Context({test:"bar"});
        str.should.eql("host=my.host.com request_id=2 test=bar");

        request3Context({test:"baz"});
        str.should.eql("host=my.other.host.com request_id=3 test=baz");
      });


      it("should inherit recursively", function(){
        var level1 = metric.context({level:1, level1: true}).use(context)
          , level2 = metric.context({level:2, level2: true}).use(level1)
          , level3 = metric.context({level:3, level3: true}).use(level2);

        context({test:"foo"});
        str.should.eql("host=my.host.com test=foo");

        level1({test:"foo"});
        str.should.eql("host=my.host.com level=1 level1=true test=foo");

        level2({test:"foo"});
        str.should.eql("host=my.host.com level=2 level1=true level2=true test=foo");

        level3({test:"foo"});
        str.should.eql("host=my.host.com level=3 level1=true level2=true level3=true test=foo");
      });
    });

    describe("context().context(obj)", function(){
      it("should create a new context that uses the current as a base", function() {
        var newContext = context.context({testing:123});

        newContext({hello: 123});
        str.should.eql("host=my.host.com testing=123 hello=123");
      });
    });

  });

});
