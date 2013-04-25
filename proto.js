/**
 * Module dependencies
 */
var debug = require("simple-debug");

/**
 * Context Prototype
 */
var proto = {}

/**
 * Format the metric
 *
 * @return {Object}
 * @api public
 */
proto.merge = function() {
  var obj = defaults.apply(null, arguments);
  obj.__proto__ = this._context;
  return obj;
};

/**
 * Use a parent context
 *
 * @param {Object} parent
 * @return {Context}
 * @api public
 */
proto.use = function(parent) {
  if(!parent) parent = {};
  this._context.__proto__ = parent._context || parent;
  return this;
};

/**
 * Profile a call
 *
 * @param {String} metric
 * @param {Object} props
 * @return {Function}
 * @api public
 */
proto.profile = function(metric, props) {
  var self = this
    , start = Date.now();

  return function(otherProps) {
    if(!otherProps) otherProps = {};
    else otherProps = clone(otherProps);

    otherProps.__proto__ = props;
    return self(metric, (Date.now() - start), "ms", otherProps);
  };
};

/**
 * Set debug mode for the context
 *
 * @param {String} name
 * @return {Context}
 */
proto.debug = function(name) {
  var context = this._context;
  if(!name) name = context.fn && context.at ? ""+context.fn+":"+context.at : "metric:debug";
  this.log = debug(name);
  return this;
};

/**
 * Inherit the proto
 */
module.exports = function(obj) {
  return merge(obj, proto);
};

/**
 * Set the default parameters
 *
 * @api private
 */
function defaults(metric, value, units, props) {
  if (typeof metric === "string") {
    var obj = {
      measure: metric,
      val: value
    };
    if(units) obj.units = units;
    merge(obj, props);
    return obj;
  }
  else {
    return clone(metric);
  };
};

/**
 * Merge object properties
 *
 * @api private
 */
function merge(a, b) {
  if (a && b) {
    for (var key in b) {
      a[key] = b[key];
    }
  }
  return a;
};

/**
 * Clone an object's properties
 *
 * @api private
 */
function clone(obj) {
  return merge({}, obj);
};
