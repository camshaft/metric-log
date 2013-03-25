
/**
 * Log formatted metrics to STDOUT
 *
 * @param {Object|String} metric
 * @param {String|Number|Object} value
 * @param {String} units
 * @return {String}
 * @api public
 */
module.exports = exports = function metric() {
  return log(defaults.apply(null, arguments));
};

/**
 * noop
 */
function noop () {};

/**
 * Apply a context to the logger
 *
 * @param {Object} context
 * @return {Logger}
 * @api public
 */
exports.context = function(obj) {
  function c() {
    return log(merge(c.inherit(), defaults.apply(null, arguments)));
  };
  c.use = function(parent) {
    c.parent = parent || {};
    return c;
  };
  c.inherit = function() {
    var parent = (c.parent.inherit || noop)() || clone(c.parent);
    return merge(parent, c.context);
  };
  c.context = obj;
  c.parent = {};
  return c;
};

function defaults(metric, value, units) {
  if (typeof metric === "string") {
    var obj = {
      metric: metric,
      val: value
    };
    if(units) obj.units = units;
    return obj;
  }
  else {
    return metric;
  };
};

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function log(obj) {
  var out = Object.keys(obj).map(function(key) {
    // Turn any objects into json
    var value = (typeof obj[key] === "object") ? JSON.stringify(obj[key]) : obj[key];
    // If we have a space or quote we need to surround it in quotes
    return key+"="+((/[\" ]+/.test(value)) ? '"'+value.replace('\\', '\\\\').replace('"','\"')+'"' : value);
  }).join(" ");

  // Print the formatted metrics to STDOUT
  console.log(out);

  return out;
};

function merge(a, b){
  if (a && b) {
    for (var key in b) {
      a[key] = b[key];
    }
  }
  return a;
};
