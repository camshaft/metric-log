metric-log
==========

Log metrics to STDOUT in a simple key=value format for easy parsing

Install
-------

`npm install --save metric-log`

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

```js
var metric = require("metric-log");

metric({host: "my.host.com", service: "requests", metric: 5, tags: ["requests", "testing"]});
  // host=my.host.com service=requests metric=5 tags="[\"requests\",\"testing\"]"
```

### metric.context(obj)

You can also setup a default context to be applied to each metric

```js
var metric = require("metric-log").context({host: "my.host.com"});

metric("response_time", 12, "ms");
  // host=my.host.com measure=response_time val=12 units=ms"
```

Tests
-----

```sh
npm test
```
