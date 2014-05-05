/**
 * Module dependencies
 */

var debug = require('debug');

/**
 * Context Prototype
 */

var proto = {}

/**
 * Format the metric
 *
 * @param {Object|String} metric
 * @param {Object|String|Number} val
 * @param {String} unit
 * @param {Object} props
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
  if (!parent) parent = {};
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
    if (!otherProps) otherProps = {};
    else otherProps = clone(otherProps);

    otherProps.__proto__ = props;
    return self(metric, (Date.now() - start), 'ms', otherProps);
  };
};

/**
 * Print a measurement
 */

proto.measure = function(metric, value, units, props) {
  this(metric, value, units, props);
};

/**
 * Print a count
 */

proto.count = function(metric, value, props) {
  var countVal = value || 1;
  this(metric, countVal, "", props, 'count');
};

/**
 * Print a event
 */

proto.event = function(metric, value, props) {
  this(metric, value, "", props, 'event');
};

/**
 * Print a sample
 */

proto.sample = function(metric, value, units, props) {
  this(metric, value, units, props, 'sample');
};

/**
 * Set debug mode for the context
 *
 * @param {String} name
 * @return {Context}
 * @api public
 */

proto.debug = function(name) {
  var context = this._context;
  if (!name) name = context.fn && context.at ? '' + context.fn + ':' + context.at : 'metric:debug';
  this.log = debug(name);
  return this;
};

/**
 * Format the context obj
 *
 * @param {Object|String} metric
 * @param {Object|String|Number} val
 * @param {String} unit
 * @param {Object} props
 * @return {String}
 * @api public
 */

proto.format = function() {
  return format(this.merge.apply(this, arguments));
};

/**
 * Inherit the proto
 *
 * @param {Object} obj
 * @return {Object}
 * @api public
 */

module.exports = function(obj) {
  return merge(obj, proto);
};

/**
 * Set the default parameters
 *
 * @param {Object|String} metric
 * @param {Object|String|Number} val
 * @param {String} unit
 * @param {Object} props
 * @return {Object}
 * @api private
 */

function defaults(metric, value, units, props, prefix) {
  if (typeof metric !== 'string') return clone(metric);

  var obj = {};
  obj[(prefix || 'measure') + '#' + metric] = '' + value + (units || '');
  return merge(obj, props);
};

/**
 * Format an object in key=value pairs
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function format(obj) {
  // Get all of the keys for the context
  var keys = [];
  for(var key in obj) {
    // Keep out blank values
    if (obj[key] !== '' && obj[key] != undefined) {
      keys.push(join(key, obj[key]));
    }
  }

  // Join the key=value
  return keys.join(" ");
};

/**
 * Escape the value and join the key=value
 *
 * @param {String}
 * @param {Object|String|Number}
 * @return {String}
 * @api private
 */

function join(key, value) {
  // Turn any objects into json
  if (typeof value === 'object') value = JSON.stringify(value);

  // If we have a space or quote we need to surround it in quotes
  if (/[\"\\ ]+/.test(value)) value = '"' + value.replace(/\\/g, '\\\\').replace(/"/g,'\\"') + '"';

  return key + '=' + value;
}

/**
 * Merge object properties
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object}
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
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function clone(obj) {
  return merge({}, obj);
};
