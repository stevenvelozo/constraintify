/**
* @license MIT
* @author <steven@velozo.com>
*/

/**
* Constraintify browser shim loader
*/

// Load the constraintify module into the browser global automatically.
var libConstraintify = require('./Constraintify.js');

if (typeof(window) === 'object')
    window.Constraintify = libConstraintify;

module.exports = libConstraintify;