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
 * @param {Object|String|Number} val
 * @param {String} unit
 * @param {Object} props
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

  // Expose extending the context
  Context.context =
  Context.extend = function(child) {
    return createContext(child).use(obj);
  };

  return Context;
};