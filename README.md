metric-log [![Build Status](https://travis-ci.org/CamShaft/metric-log.png?branch=master)](https://travis-ci.org/CamShaft/metric-log)
==========

Log metrics to STDOUT in a simple key=value format for easy parsing.

Install
-------

```sh
npm install --save metric-log
```

API
-----

### metric(measure, value)

```js
var metric = require("metric-log");

metric("request", 1);
  // measure=request val=1
```

### metric(measure, value, units)

```js
var metric = require("metric-log");

metric("response_time", 40, "ms");
  // measure=response_time val=40 units=ms
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
  // host=my.host.com measure=response_time val=12 units=ms
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
   201207.24346076458 metrics/sec
․metric(measure, value, units) 
   191791.33103183736 metrics/sec
․metric(obj) 
   267379.67914438504 metrics/sec
․metric(deepObj) 
   136742.78681799537 metrics/sec
․context(measure, value) 
   157629.25598991173 metrics/sec
․context(measure, value, units) 
   143678.16091954024 metrics/sec
․context(obj) 
   156961.2305760477 metrics/sec
․context(deepObj) 
   109613.0658774526 metrics/sec


  9 tests complete (50 seconds)
```
