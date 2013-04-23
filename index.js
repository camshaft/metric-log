/**
 * Module dependencies
 */
var proto = require("./proto");

/**
 * Root context
 */
var root;

/**
 * Log formatted metrics
 *
 * @param {Object|String} metric
 * @param {String|Number|Object} value
 * @param {String} units
 * @return {String}
 * @api public
 */
module.exports = exports = function metric() {
  return root.apply(root, arguments);
};

/**
 * Expose log function
 */
exports.log = console.log.bind(console);

/**
 * Create the root context
 */
exports._root = root = createContext();

/**
 * Extend the root context
 */
exports.context = root.context.bind(root);

/**
 * Profile a function call in the root context
 */
exports.profile = root.profile.bind(root);

/**
 * Expose setting the root's __proto__
 */
exports.use = root.use.bind(root);

/**
 * Expose root format
 */
exports.format = root.format.bind(root);

/**
 * Apply a context to the logger
 *
 * @param {Object} context
 * @return {Logger}
 * @api public
 */
function createContext(obj) {
  // Create a new context
  function Context() {
    return (Context.log || exports.log)(Context.format.apply(Context, arguments));
  };

  // Setup the context obj
  Context._context = obj || {};

  // Merge the prototype
  proto(Context);

  // Expose formatting the context
  Context.format = function() {
    return format(Context.merge.apply(Context, arguments));
  };

  // Expose extending the context
  Context.context =
  Context.extend = function(child) {
    return createContext(child).use(obj);
  };

  return Context;
};

/**
 * Format an object in key=value pairs
 *
 * @param {Object} obj
 * @api private
 */
function format(obj) {
  // Get all of the keys for the context
  var keys = [];
  for(var key in obj) if(obj[key] !== '') keys.push(join(key, obj[key]));

  // Join the key=value
  return keys.join(" ");
};

/**
 * Escape the value and join the key=value
 *
 * @param {String}
 * @param {Object|String|Number}
 * @return {String}
 */
function join(key, value) {
  // Turn any objects into json
  if(typeof value === "object") value = JSON.stringify(value);

  // If we have a space or quote we need to surround it in quotes
  if(/[\"\\ ]+/.test(value)) value = '"'+value.replace(/\\/g, '\\\\').replace(/"/g,'\\"')+'"';

  return key+"="+value;
}
