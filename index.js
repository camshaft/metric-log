
/**
 * Log formatted metrics to STDOUT
 *
 * @param {Object|String} metric
 * @param {String|Number|Object} value
 * @param {String} units
 * @return {String}
 * @api public
 */
module.exports = exports = function metric () {
  return log(defaults.apply(null, arguments));
}

/**
 * Apply a context to the logger
 *
 * @param {Object} context
 * @return {Logger}
 * @api public
 */
exports.context = function(obj) {
  return function() {
    return log(merge(clone(obj), defaults.apply(null, arguments)));
  };
}

function defaults(metric, value, units) {
  if (typeof metric === "string") {
    var obj = {
      metric: metric,
      val: value,
      units: units
    };
    if(!units) delete obj.units;
    return obj;
  }
  else {
    return metric;
  };
}

function log(obj) {
  var out = Object.keys(obj).map(function(key) {
    // Turn any objects into json
    var value = (typeof obj[key] === "object") ? JSON.stringify(obj[key]) : obj[key];
    // If we have a space or quote we need to surround it in quotes
    if(/[\" ]+/.test(value)) value = '"'+value.replace('"','\"')+'"';

    return key+"="+value;
  }).join(" ");
  // Print the formatted metrics to STDOUT
  console.log(out);
  return out;
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function merge(a, b){
  if (a && b) {
    for (var key in b) {
      a[key] = b[key];
    }
  }
  return a;
};
