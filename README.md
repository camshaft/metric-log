metric-log [![Build Status](https://travis-ci.org/CamShaft/metric-log.png?branch=master)](https://travis-ci.org/CamShaft/metric-log)
==========

Log metrics in a simple key=value format for easy parsing. Metric-log uses [l2met conventions](https://github.com/ryandotsmith/l2met/wiki/Usage) which are used by [Heroku](https://devcenter.heroku.com/articles/add-on-provider-log-integration#message-conventions).



Install
-------

```sh
npm install --save metric-log
```

Primary Functions
----
Here are the most important features:


- [metric()](#metricmeasure-value) ```measure#request=1```
- [metric.profile()](#metricprofileid-obj) ```measure#my-api-call=203ms //profile duration```
- [metric.context()](#metriccontextobj) -  (set a parent context which logs can inherit from)

[**L2met functions**](https://github.com/ryandotsmith/l2met/wiki/Usage) 
- [metric.measure()](#metricmeasuremetric-value-units-obj) ```measure#db.latency=530ms   //similar to metric()```
- [metric.count()](#metriccountmetric-value-obj) ```count#action.home_page.login.success=1``` 
- [metric.sample()](#metricsamplemetric-value-units-obj) ```sample#appName.dyno1.load_avg_5=234mb``` 
- [metric.event()](#metriceventmetric-value-obj) ```event#title=deploy event#starttime=23456432```





API
-----

### metric(measure, value)

```js
var metric = require("metric-log");

metric("request", 1);
  // measure#request=1
```

### metric(measure, value, units)

```js
var metric = require("metric-log");

metric("response_time", 40, "ms");
  // measure#response_time=40ms
```

### metric(measure, value, units, obj)

```js
var metric = require("metric-log");

metric("response_time", 40, "ms", {lib:'my-lib'});
  // measure#response_time=40ms lib=my-lib
```

### metric(obj)

Complex objects can also be passed. Any nested objects/arrays will be converted to JSON.

```js
var metric = require("metric-log");

metric({host: "my.host.com", service: "requests", metric: 5, tags: ["requests", "testing"]});
  // host=my.host.com service=requests metric=5 tags="[\"requests\",\"testing\"]"
```

### metric.context(obj)

You can also setup a default context to be applied to each metric.

```js
var metric = require("metric-log").context({host: "my.host.com"});

metric("response_time", 12, "ms");
  // host=my.host.com measure#response_time=12ms
```

### metric.context(obj).use(parentContext)

You can also inherit from parent contexts

```js
var express = require("express")
  , metric = require("metric-log")
  , parent = metric.context({host: "my.host.com"});

var app = express();

app.use(function(req, res, next) {
  req.metric = metric.context({request_id: req.get("x-request-id")}).use(parent);
});

app.get("/", function(req, res) {
  req.metric("home_page", 1); //this use case should probably use metric.count()
  // host=my.host.com request_id=12345 measure#home_page=1
});
```

### metric.profile(id[, obj])

Helper function to profile processes like calling an api or database.

```js
var metric = require('metric');

var end = metric.profile('my-api-call');

api('id', function(err, result){
  end();
  // measure#my-api-call=203ms
});
```

You can also pass some metrics as a second parameter

```js
var end = metric.profile('my-api-call', {at:"info", lib:"my-lib"});

api('id', function(err, result){
  end({err:err});
  // measure#my-api-call=203ms at=info lib=my-lib err=null
});
```

### metric.measure(metric, value[, units, obj])

Only first 2 parameters are required.

Useful for measuring data like latency.

```js
var metric = require("metric-log");

metric.measure("response_time", 20);
  // measure#response_time=20

metric.measure("response_time", 40, "ms", {lib:'my-lib'});
  // measure#response_time=40ms lib=my-lib
```

### metric.count(metric[, value, obj])

Only first parameter is required.

Useful for counting business metrics or similar data.

```js
var metric = require("metric-log");

metric.count("action.login.success");
  // count#action.login.success=1

metric.count("action.login.failure", 5, {at:'home-page'});
  // count#action.login.failure=5 at=home-page
```

### metric.sample(metric, value[, units, obj])

Useful for sampling data like memory usage.

```js
var metric = require("metric-log");

metric.sample("home.dyno1.load_avg_5", 232, "mb", {lib: 'home-app'});
  // sample#home.dyno1.load_avg_5=232mb lib=home-app

```

### metric.event(metric, value[, obj])

Useful for logging infrequent or one-off events like deploys.

```js
var metric = require("metric-log");

metric.event("title", "deploy", {"event#start_time": 1234567890, source: "dyno5"});
  // event#title=deploy event#start_time=1234567890 source=dyno5

```

Tests
-----

```sh
npm test
```

Benchmarks
----------

These were some benchmarks run on my MacBook Pro.

```sh
$ npm run-script bench

․metric(measure, value) 
   885739.5925597874 metrics/sec
․metric(measure, value, units) 
   787401.5748031496 metrics/sec
․metric(obj) 
   1901140.6844106463 metrics/sec
․metric(deepObj) 
   344589.9379738112 metrics/sec
․context(measure, value) 
   372023.8095238095 metrics/sec
․context(measure, value, units) 
   318066.15776081424 metrics/sec
․context(obj) 
   365363.5367190354 metrics/sec
․context(deepObj) 
   195694.71624266144 metrics/sec


  8 tests complete (20 seconds)
```
