(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c){ return c(i,!0); }if(u){ return u(i,!0); }var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++){ o(t[i]); }return o}return r})()({1:[function(require,module,exports){
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
    { window.Constraintify = libConstraintify; }

module.exports = libConstraintify;
},{"./Constraintify.js":3}],2:[function(require,module,exports){
/**
* @license MIT
* @author <steven@velozo.com>
*/

/**
* Constraintify Logging
*
* @class ConstraintifyLog
*/

var ConstraintifyLog = function ConstraintifyLog(pSettings)
{
	this._Settings = pSettings;
};

ConstraintifyLog.prototype.writeConsole = function writeConsole (pLevel, pMessage, pObject)
{
	// Write the message
	console.log('['+pLevel+'] '+pMessage);

	// Write out the object if it is passed in
	if (typeof(pObject) !== 'undefined')
	{
		console.log(JSON.stringify(pObject, null, 4));
	}
};

ConstraintifyLog.prototype.trace = function trace (pMessage, pObject)
{
	this.writeConsole('TRACE', pMessage, pObject);
};

ConstraintifyLog.prototype.debug = function debug (pMessage, pObject)
{
	this.writeConsole('DEBUG', pMessage, pObject);
};

ConstraintifyLog.prototype.info = function info (pMessage, pObject)
{
	this.writeConsole('INFO', pMessage, pObject);
};

ConstraintifyLog.prototype.warning = function warning (pMessage, pObject)
{
	this.writeConsole('WARNING', pMessage, pObject);
};

ConstraintifyLog.prototype.error = function error (pMessage, pObject)
{
	this.writeConsole('ERROR', pMessage, pObject);
};


// Log the current date and time, well formatted (with Moment-Timezone)
ConstraintifyLog.prototype.logTime = function logTime (pMessage)
{
	var tmpMessage = (typeof(pMessage) !== 'undefined') ? pMessage : 'Time';
	var tmpDate = new Date();

	this.info(tmpMessage+': '+tmpDate.toString())
};

// Get a timestamp 
ConstraintifyLog.prototype.getTimeStamp = function getTimeStamp ()
{
	return +new Date();
};

ConstraintifyLog.prototype.getTimeDelta = function getTimeDelta (pTimeStamp)
{
	var tmpEndTime = +new Date();
	return tmpEndTime-pTimeStamp;
};

// Log the delta between a timestamp, and now with a message
ConstraintifyLog.prototype.logTimeDelta = function logTimeDelta (pTimeStamp, pMessage)
{
	var tmpMessage = (typeof(pMessage) !== 'undefined') ? pMessage : 'Time Measurement';

	var tmpEndTime = +new Date();
	var tmpOperationTime = tmpEndTime-pTimeStamp;

	this.info(tmpMessage +' ('+tmpOperationTime+'ms)');
};

module.exports = ConstraintifyLog;
},{}],3:[function(require,module,exports){
/**
* @license MIT
* @author <steven@velozo.com>
*/

/**
* Constraintify Graph Traversal Library
*
* @class Constraintify
*/
var Constraintify = function Constraintify(pSettings)
{
	this._Dependencies = {};

	this._Settings = (typeof(pSettings) === 'object') ? pSettings : (
		{
			// If this is true, show a whole lotta logs
			DebugLog: true,
			DebugLogNoisy: false
		});

	// This has behaviors similar to bunyan, for consistency
	this.log = new (require('./Constraintify-Log.js'))(this._Settings);

	this.Sets = {};
};

Constraintify.prototype.addSet = function addSet (pSetName)
{
	if (this.Sets.hasOwnProperty(pSetName))
	{
		if (this._Settings.DebugLogNoisy) { this.log.warning('Attempted to add set ['+pSetName+'] but it already exists.'); }
		return false;
	}
	if (this._Settings.DebugLog) { this.log.info('Adding set ['+pSetName+'].'); }

	this.Sets[pSetName] = {};
	return true;
};

Constraintify.prototype.addSetValue = function addSetValue (pSetName, pValue)
{
	if(!this.Sets.hasOwnProperty(pSetName))
	{
		if (this._Settings.DebugLog) { this.log.warning('Attempted to add value ['+pValue+'] to set ['+pSetName+'] but set does not exist.  Adding set now.'); }
		this.addSet(pSetName);
	}

	if (this.Sets[pSetName].hasOwnProperty(pValue))
	{
		if (this._Settings.DebugLogNoisy) { this.log.warning('Attempted to add DUPLICATE value ['+pValue+'] to set ['+pSetName+'] but value is already in set.'); }
		return false;
	}

	if (this._Settings.DebugLog) { this.log.info('Adding value ['+pValue+'] to set ['+pSetName+'].'); }
	this.Sets[pSetName][pValue] = {};
};

Constraintify.prototype.addSetConnection = function addSetConnection (pSetName, pValue, pConnectedSet)
{
	this.addSetValue(pSetName, pValue);

	if (this.Sets[pSetName][pValue].hasOwnProperty(pConnectedSet))
	{
		if (this._Settings.DebugLogNoisy) { this.log.info('Set ['+pSetName+']->['+pValue+'] already connected to set ['+pConnectedSet+'].'); }
		return false;
	}

	if (this._Settings.DebugLog) { this.log.info('Connecting Set ['+pSetName+']->['+pValue+'] to set ['+pConnectedSet+'].'); }
	this.Sets[pSetName][pValue][pConnectedSet] = {};
};

Constraintify.prototype.connectSetValue = function connectSetValue (pLeftSetName, pLeftValue, pRightSetName, pRightValue)
{
	this.addSet(pLeftSetName);
	this.addSet(pRightSetName);
	this.addSetValue(pLeftSetName, pLeftValue);
	this.addSetValue(pRightSetName, pRightValue);
	this.addSetConnection(pLeftSetName, pLeftValue, pRightSetName);

	this.Sets[pLeftSetName][pLeftValue][pRightSetName][pRightValue] = true;
};

Constraintify.prototype.addSetValueConnection = function addSetValueConnection (pLeftSetName, pLeftValue, pRightSetName, pRightValue)
{
	this.addSet(pLeftSetName);
	this.addSet(pRightSetName);

	this.addSetValue(pLeftSetName, pLeftValue);
	this.addSetValue(pRightSetName, pRightValue);

	this.connectSetValue(pLeftSetName, pLeftValue, pRightSetName, pRightValue);
};

Constraintify.prototype.addSetValueConnectionBidirectional = function addSetValueConnectionBidirectional (pLeftSetName, pLeftValue, pRightSetName, pRightValue)
{
	this.addSetValueConnection(pLeftSetName, pLeftValue, pRightSetName, pRightValue);
	this.addSetValueConnection(pRightSetName, pRightValue, pLeftSetName, pLeftValue);
};

Constraintify.prototype.getSetValues = function getSetValues (pLeftSetName)
{
	// If the set doesn't exist, return empty
	if (!this.Sets.hasOwnProperty(pLeftSetName))
	{
		return [];
	}
	return Object.keys(this.Sets[pLeftSetName]);
};

Constraintify.prototype.getSetConnectedValues = function getSetConnectedValues (pLeftSetName, pLeftValue, pRightSetName)
{
	// If the set doesn't exist, return empty
	if (!this.Sets.hasOwnProperty(pLeftSetName))
	{
		return [];
	}
	// If this value isn't in the set return empty.
	if (!this.Sets[pLeftSetName].hasOwnProperty(pLeftValue))
	{
		return [];
	}
	// If this value isn't connected to the right set return empty.
	if (!this.Sets[pLeftSetName][pLeftValue].hasOwnProperty(pRightSetName))
	{
		return [];
	}
	return Object.keys(this.Sets[pLeftSetName][pLeftValue][pRightSetName]);
};

Constraintify.prototype.checkSetValue = function checkSetValue (pLeftSetName, pLeftValue)
{
	if (!this.Sets.hasOwnProperty(pLeftSetName))
		{ return false; }
	return this.Sets[pLeftSetName].hasOwnProperty(pLeftValue);
};

Constraintify.prototype.checkSetConnectedValue = function checkSetConnectedValue (pLeftSetName, pLeftValue, pRightSetName, pRightSetValue)
{
	// If the set doesn't exist, return false
	if (!this.Sets.hasOwnProperty(pLeftSetName))
		{ return false; }
	// If this value isn't in the set return false.
	if (!this.Sets[pLeftSetName].hasOwnProperty(pLeftValue))
		{ return false; }
	// If this value isn't connected to the right set return false.
	if (!this.Sets[pLeftSetName][pLeftValue].hasOwnProperty(pRightSetName))
		{ return false; }
	return this.Sets[pLeftSetName][pLeftValue][pRightSetName].hasOwnProperty(pRightSetValue);
};;

module.exports = Constraintify;
},{"./Constraintify-Log.js":2}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2UvQ29uc3RyYWludGlmeS1Ccm93c2VyLVNoaW0uanMiLCJzb3VyY2UvQ29uc3RyYWludGlmeS1Mb2cuanMiLCJzb3VyY2UvQ29uc3RyYWludGlmeS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLyoqXG4qIEBsaWNlbnNlIE1JVFxuKiBAYXV0aG9yIDxzdGV2ZW5AdmVsb3pvLmNvbT5cbiovXG5cbi8qKlxuKiBDb25zdHJhaW50aWZ5IGJyb3dzZXIgc2hpbSBsb2FkZXJcbiovXG5cbi8vIExvYWQgdGhlIGNvbnN0cmFpbnRpZnkgbW9kdWxlIGludG8gdGhlIGJyb3dzZXIgZ2xvYmFsIGF1dG9tYXRpY2FsbHkuXG52YXIgbGliQ29uc3RyYWludGlmeSA9IHJlcXVpcmUoJy4vQ29uc3RyYWludGlmeS5qcycpO1xuXG5pZiAodHlwZW9mKHdpbmRvdykgPT09ICdvYmplY3QnKVxuICAgIHdpbmRvdy5Db25zdHJhaW50aWZ5ID0gbGliQ29uc3RyYWludGlmeTtcblxubW9kdWxlLmV4cG9ydHMgPSBsaWJDb25zdHJhaW50aWZ5OyIsIi8qKlxuKiBAbGljZW5zZSBNSVRcbiogQGF1dGhvciA8c3RldmVuQHZlbG96by5jb20+XG4qL1xuXG4vKipcbiogQ29uc3RyYWludGlmeSBMb2dnaW5nXG4qXG4qIEBjbGFzcyBDb25zdHJhaW50aWZ5TG9nXG4qL1xuXG5jbGFzcyBDb25zdHJhaW50aWZ5TG9nXG57XG5cdGNvbnN0cnVjdG9yKHBTZXR0aW5ncylcblx0e1xuXHRcdHRoaXMuX1NldHRpbmdzID0gcFNldHRpbmdzO1xuXHR9XG5cblx0d3JpdGVDb25zb2xlKHBMZXZlbCwgcE1lc3NhZ2UsIHBPYmplY3QpXG5cdHtcblx0XHQvLyBXcml0ZSB0aGUgbWVzc2FnZVxuXHRcdGNvbnNvbGUubG9nKCdbJytwTGV2ZWwrJ10gJytwTWVzc2FnZSk7XG5cblx0XHQvLyBXcml0ZSBvdXQgdGhlIG9iamVjdCBpZiBpdCBpcyBwYXNzZWQgaW5cblx0XHRpZiAodHlwZW9mKHBPYmplY3QpICE9PSAndW5kZWZpbmVkJylcblx0XHR7XG5cdFx0XHRjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShwT2JqZWN0LCBudWxsLCA0KSk7XG5cdFx0fVxuXHR9XG5cblx0dHJhY2UocE1lc3NhZ2UsIHBPYmplY3QpXG5cdHtcblx0XHR0aGlzLndyaXRlQ29uc29sZSgnVFJBQ0UnLCBwTWVzc2FnZSwgcE9iamVjdCk7XG5cdH1cblxuXHRkZWJ1ZyhwTWVzc2FnZSwgcE9iamVjdClcblx0e1xuXHRcdHRoaXMud3JpdGVDb25zb2xlKCdERUJVRycsIHBNZXNzYWdlLCBwT2JqZWN0KTtcblx0fVxuXG5cdGluZm8ocE1lc3NhZ2UsIHBPYmplY3QpXG5cdHtcblx0XHR0aGlzLndyaXRlQ29uc29sZSgnSU5GTycsIHBNZXNzYWdlLCBwT2JqZWN0KTtcblx0fVxuXG5cdHdhcm5pbmcocE1lc3NhZ2UsIHBPYmplY3QpXG5cdHtcblx0XHR0aGlzLndyaXRlQ29uc29sZSgnV0FSTklORycsIHBNZXNzYWdlLCBwT2JqZWN0KTtcblx0fVxuXG5cdGVycm9yKHBNZXNzYWdlLCBwT2JqZWN0KVxuXHR7XG5cdFx0dGhpcy53cml0ZUNvbnNvbGUoJ0VSUk9SJywgcE1lc3NhZ2UsIHBPYmplY3QpO1xuXHR9XG5cblxuXHQvLyBMb2cgdGhlIGN1cnJlbnQgZGF0ZSBhbmQgdGltZSwgd2VsbCBmb3JtYXR0ZWQgKHdpdGggTW9tZW50LVRpbWV6b25lKVxuXHRsb2dUaW1lKHBNZXNzYWdlKVxuXHR7XG5cdFx0bGV0IHRtcE1lc3NhZ2UgPSAodHlwZW9mKHBNZXNzYWdlKSAhPT0gJ3VuZGVmaW5lZCcpID8gcE1lc3NhZ2UgOiAnVGltZSc7XG5cdFx0bGV0IHRtcERhdGUgPSBuZXcgRGF0ZSgpO1xuXG5cdFx0dGhpcy5pbmZvKHRtcE1lc3NhZ2UrJzogJyt0bXBEYXRlLnRvU3RyaW5nKCkpXG5cdH1cblxuXHQvLyBHZXQgYSB0aW1lc3RhbXAgXG5cdGdldFRpbWVTdGFtcCgpXG5cdHtcblx0XHRyZXR1cm4gK25ldyBEYXRlKCk7XG5cdH1cblxuXHRnZXRUaW1lRGVsdGEocFRpbWVTdGFtcClcblx0e1xuXHRcdGxldCB0bXBFbmRUaW1lID0gK25ldyBEYXRlKCk7XG5cdFx0cmV0dXJuIHRtcEVuZFRpbWUtcFRpbWVTdGFtcDtcblx0fVxuXG5cdC8vIExvZyB0aGUgZGVsdGEgYmV0d2VlbiBhIHRpbWVzdGFtcCwgYW5kIG5vdyB3aXRoIGEgbWVzc2FnZVxuXHRsb2dUaW1lRGVsdGEocFRpbWVTdGFtcCwgcE1lc3NhZ2UpXG5cdHtcblx0XHRsZXQgdG1wTWVzc2FnZSA9ICh0eXBlb2YocE1lc3NhZ2UpICE9PSAndW5kZWZpbmVkJykgPyBwTWVzc2FnZSA6ICdUaW1lIE1lYXN1cmVtZW50JztcblxuXHRcdGxldCB0bXBFbmRUaW1lID0gK25ldyBEYXRlKCk7XG5cdFx0bGV0IHRtcE9wZXJhdGlvblRpbWUgPSB0bXBFbmRUaW1lLXBUaW1lU3RhbXA7XG5cblx0XHR0aGlzLmluZm8odG1wTWVzc2FnZSArJyAoJyt0bXBPcGVyYXRpb25UaW1lKydtcyknKTtcblx0fVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29uc3RyYWludGlmeUxvZzsiLCIvKipcbiogQGxpY2Vuc2UgTUlUXG4qIEBhdXRob3IgPHN0ZXZlbkB2ZWxvem8uY29tPlxuKi9cblxuLyoqXG4qIENvbnN0cmFpbnRpZnkgR3JhcGggVHJhdmVyc2FsIExpYnJhcnlcbipcbiogQGNsYXNzIENvbnN0cmFpbnRpZnlcbiovXG5jbGFzcyBDb25zdHJhaW50aWZ5XG57XG5cdGNvbnN0cnVjdG9yKHBTZXR0aW5ncylcblx0e1xuXHRcdHRoaXMuX0RlcGVuZGVuY2llcyA9IHt9O1xuXG5cdFx0dGhpcy5fU2V0dGluZ3MgPSAodHlwZW9mKHBTZXR0aW5ncykgPT09ICdvYmplY3QnKSA/IHBTZXR0aW5ncyA6IChcblx0XHRcdHtcblx0XHRcdFx0Ly8gSWYgdGhpcyBpcyB0cnVlLCBzaG93IGEgd2hvbGUgbG90dGEgbG9nc1xuXHRcdFx0XHREZWJ1Z0xvZzogdHJ1ZSxcblx0XHRcdFx0RGVidWdMb2dOb2lzeTogZmFsc2Vcblx0XHRcdH0pO1xuXG5cdFx0Ly8gVGhpcyBoYXMgYmVoYXZpb3JzIHNpbWlsYXIgdG8gYnVueWFuLCBmb3IgY29uc2lzdGVuY3lcblx0XHR0aGlzLmxvZyA9IG5ldyAocmVxdWlyZSgnLi9Db25zdHJhaW50aWZ5LUxvZy5qcycpKSh0aGlzLl9TZXR0aW5ncyk7XG5cblx0XHR0aGlzLlNldHMgPSB7fTtcblx0fVxuXG5cdGFkZFNldChwU2V0TmFtZSlcblx0e1xuXHRcdGlmICh0aGlzLlNldHMuaGFzT3duUHJvcGVydHkocFNldE5hbWUpKVxuXHRcdHtcblx0XHRcdGlmICh0aGlzLl9TZXR0aW5ncy5EZWJ1Z0xvZ05vaXN5KSB0aGlzLmxvZy53YXJuaW5nKCdBdHRlbXB0ZWQgdG8gYWRkIHNldCBbJytwU2V0TmFtZSsnXSBidXQgaXQgYWxyZWFkeSBleGlzdHMuJyk7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdGlmICh0aGlzLl9TZXR0aW5ncy5EZWJ1Z0xvZykgdGhpcy5sb2cuaW5mbygnQWRkaW5nIHNldCBbJytwU2V0TmFtZSsnXS4nKTtcblxuXHRcdHRoaXMuU2V0c1twU2V0TmFtZV0gPSB7fTtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdGFkZFNldFZhbHVlKHBTZXROYW1lLCBwVmFsdWUpXG5cdHtcblx0XHRpZighdGhpcy5TZXRzLmhhc093blByb3BlcnR5KHBTZXROYW1lKSlcblx0XHR7XG5cdFx0XHRpZiAodGhpcy5fU2V0dGluZ3MuRGVidWdMb2cpIHRoaXMubG9nLndhcm5pbmcoJ0F0dGVtcHRlZCB0byBhZGQgdmFsdWUgWycrcFZhbHVlKyddIHRvIHNldCBbJytwU2V0TmFtZSsnXSBidXQgc2V0IGRvZXMgbm90IGV4aXN0LiAgQWRkaW5nIHNldCBub3cuJyk7XG5cdFx0XHR0aGlzLmFkZFNldChwU2V0TmFtZSk7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuU2V0c1twU2V0TmFtZV0uaGFzT3duUHJvcGVydHkocFZhbHVlKSlcblx0XHR7XG5cdFx0XHRpZiAodGhpcy5fU2V0dGluZ3MuRGVidWdMb2dOb2lzeSkgdGhpcy5sb2cud2FybmluZygnQXR0ZW1wdGVkIHRvIGFkZCBEVVBMSUNBVEUgdmFsdWUgWycrcFZhbHVlKyddIHRvIHNldCBbJytwU2V0TmFtZSsnXSBidXQgdmFsdWUgaXMgYWxyZWFkeSBpbiBzZXQuJyk7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuX1NldHRpbmdzLkRlYnVnTG9nKSB0aGlzLmxvZy5pbmZvKCdBZGRpbmcgdmFsdWUgWycrcFZhbHVlKyddIHRvIHNldCBbJytwU2V0TmFtZSsnXS4nKTtcblx0XHR0aGlzLlNldHNbcFNldE5hbWVdW3BWYWx1ZV0gPSB7fTtcblx0fVxuXG5cdGFkZFNldENvbm5lY3Rpb24ocFNldE5hbWUsIHBWYWx1ZSwgcENvbm5lY3RlZFNldClcblx0e1xuXHRcdHRoaXMuYWRkU2V0VmFsdWUocFNldE5hbWUsIHBWYWx1ZSk7XG5cblx0XHRpZiAodGhpcy5TZXRzW3BTZXROYW1lXVtwVmFsdWVdLmhhc093blByb3BlcnR5KHBDb25uZWN0ZWRTZXQpKVxuXHRcdHtcblx0XHRcdGlmICh0aGlzLl9TZXR0aW5ncy5EZWJ1Z0xvZ05vaXN5KSB0aGlzLmxvZy5pbmZvKCdTZXQgWycrcFNldE5hbWUrJ10tPlsnK3BWYWx1ZSsnXSBhbHJlYWR5IGNvbm5lY3RlZCB0byBzZXQgWycrcENvbm5lY3RlZFNldCsnXS4nKTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5fU2V0dGluZ3MuRGVidWdMb2cpIHRoaXMubG9nLmluZm8oJ0Nvbm5lY3RpbmcgU2V0IFsnK3BTZXROYW1lKyddLT5bJytwVmFsdWUrJ10gdG8gc2V0IFsnK3BDb25uZWN0ZWRTZXQrJ10uJyk7XG5cdFx0dGhpcy5TZXRzW3BTZXROYW1lXVtwVmFsdWVdW3BDb25uZWN0ZWRTZXRdID0ge307XG5cdH1cblxuXHRjb25uZWN0U2V0VmFsdWUocExlZnRTZXROYW1lLCBwTGVmdFZhbHVlLCBwUmlnaHRTZXROYW1lLCBwUmlnaHRWYWx1ZSlcblx0e1xuXHRcdHRoaXMuYWRkU2V0KHBMZWZ0U2V0TmFtZSk7XG5cdFx0dGhpcy5hZGRTZXQocFJpZ2h0U2V0TmFtZSk7XG5cdFx0dGhpcy5hZGRTZXRWYWx1ZShwTGVmdFNldE5hbWUsIHBMZWZ0VmFsdWUpO1xuXHRcdHRoaXMuYWRkU2V0VmFsdWUocFJpZ2h0U2V0TmFtZSwgcFJpZ2h0VmFsdWUpO1xuXHRcdHRoaXMuYWRkU2V0Q29ubmVjdGlvbihwTGVmdFNldE5hbWUsIHBMZWZ0VmFsdWUsIHBSaWdodFNldE5hbWUpO1xuXG5cdFx0dGhpcy5TZXRzW3BMZWZ0U2V0TmFtZV1bcExlZnRWYWx1ZV1bcFJpZ2h0U2V0TmFtZV1bcFJpZ2h0VmFsdWVdID0gdHJ1ZTtcblx0fVxuXG5cdGFkZFNldFZhbHVlQ29ubmVjdGlvbihwTGVmdFNldE5hbWUsIHBMZWZ0VmFsdWUsIHBSaWdodFNldE5hbWUsIHBSaWdodFZhbHVlKVxuXHR7XG5cdFx0dGhpcy5hZGRTZXQocExlZnRTZXROYW1lKTtcblx0XHR0aGlzLmFkZFNldChwUmlnaHRTZXROYW1lKTtcblxuXHRcdHRoaXMuYWRkU2V0VmFsdWUocExlZnRTZXROYW1lLCBwTGVmdFZhbHVlKTtcblx0XHR0aGlzLmFkZFNldFZhbHVlKHBSaWdodFNldE5hbWUsIHBSaWdodFZhbHVlKTtcblxuXHRcdHRoaXMuY29ubmVjdFNldFZhbHVlKHBMZWZ0U2V0TmFtZSwgcExlZnRWYWx1ZSwgcFJpZ2h0U2V0TmFtZSwgcFJpZ2h0VmFsdWUpO1xuXHR9XG5cblx0YWRkU2V0VmFsdWVDb25uZWN0aW9uQmlkaXJlY3Rpb25hbChwTGVmdFNldE5hbWUsIHBMZWZ0VmFsdWUsIHBSaWdodFNldE5hbWUsIHBSaWdodFZhbHVlKVxuXHR7XG5cdFx0dGhpcy5hZGRTZXRWYWx1ZUNvbm5lY3Rpb24ocExlZnRTZXROYW1lLCBwTGVmdFZhbHVlLCBwUmlnaHRTZXROYW1lLCBwUmlnaHRWYWx1ZSk7XG5cdFx0dGhpcy5hZGRTZXRWYWx1ZUNvbm5lY3Rpb24ocFJpZ2h0U2V0TmFtZSwgcFJpZ2h0VmFsdWUsIHBMZWZ0U2V0TmFtZSwgcExlZnRWYWx1ZSk7XG5cdH1cblxuXHRnZXRTZXRWYWx1ZXMocExlZnRTZXROYW1lKVxuXHR7XG5cdFx0Ly8gSWYgdGhlIHNldCBkb2Vzbid0IGV4aXN0LCByZXR1cm4gZW1wdHlcblx0XHRpZiAoIXRoaXMuU2V0cy5oYXNPd25Qcm9wZXJ0eShwTGVmdFNldE5hbWUpKVxuXHRcdHtcblx0XHRcdHJldHVybiBbXTtcblx0XHR9XG5cdFx0cmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuU2V0c1twTGVmdFNldE5hbWVdKTtcblx0fVxuXG5cdGdldFNldENvbm5lY3RlZFZhbHVlcyhwTGVmdFNldE5hbWUsIHBMZWZ0VmFsdWUsIHBSaWdodFNldE5hbWUpXG5cdHtcblx0XHQvLyBJZiB0aGUgc2V0IGRvZXNuJ3QgZXhpc3QsIHJldHVybiBlbXB0eVxuXHRcdGlmICghdGhpcy5TZXRzLmhhc093blByb3BlcnR5KHBMZWZ0U2V0TmFtZSkpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIFtdO1xuXHRcdH1cblx0XHQvLyBJZiB0aGlzIHZhbHVlIGlzbid0IGluIHRoZSBzZXQgcmV0dXJuIGVtcHR5LlxuXHRcdGlmICghdGhpcy5TZXRzW3BMZWZ0U2V0TmFtZV0uaGFzT3duUHJvcGVydHkocExlZnRWYWx1ZSkpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIFtdO1xuXHRcdH1cblx0XHQvLyBJZiB0aGlzIHZhbHVlIGlzbid0IGNvbm5lY3RlZCB0byB0aGUgcmlnaHQgc2V0IHJldHVybiBlbXB0eS5cblx0XHRpZiAoIXRoaXMuU2V0c1twTGVmdFNldE5hbWVdW3BMZWZ0VmFsdWVdLmhhc093blByb3BlcnR5KHBSaWdodFNldE5hbWUpKVxuXHRcdHtcblx0XHRcdHJldHVybiBbXTtcblx0XHR9XG5cdFx0cmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuU2V0c1twTGVmdFNldE5hbWVdW3BMZWZ0VmFsdWVdW3BSaWdodFNldE5hbWVdKTtcblx0fVxuXG5cdGNoZWNrU2V0VmFsdWUocExlZnRTZXROYW1lLCBwTGVmdFZhbHVlKVxuXHR7XG5cdFx0aWYgKCF0aGlzLlNldHMuaGFzT3duUHJvcGVydHkocExlZnRTZXROYW1lKSlcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRyZXR1cm4gdGhpcy5TZXRzW3BMZWZ0U2V0TmFtZV0uaGFzT3duUHJvcGVydHkocExlZnRWYWx1ZSk7XG5cdH1cblxuXHRjaGVja1NldENvbm5lY3RlZFZhbHVlKHBMZWZ0U2V0TmFtZSwgcExlZnRWYWx1ZSwgcFJpZ2h0U2V0TmFtZSwgcFJpZ2h0U2V0VmFsdWUpXG5cdHtcblx0XHQvLyBJZiB0aGUgc2V0IGRvZXNuJ3QgZXhpc3QsIHJldHVybiBmYWxzZVxuXHRcdGlmICghdGhpcy5TZXRzLmhhc093blByb3BlcnR5KHBMZWZ0U2V0TmFtZSkpXG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0Ly8gSWYgdGhpcyB2YWx1ZSBpc24ndCBpbiB0aGUgc2V0IHJldHVybiBmYWxzZS5cblx0XHRpZiAoIXRoaXMuU2V0c1twTGVmdFNldE5hbWVdLmhhc093blByb3BlcnR5KHBMZWZ0VmFsdWUpKVxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdC8vIElmIHRoaXMgdmFsdWUgaXNuJ3QgY29ubmVjdGVkIHRvIHRoZSByaWdodCBzZXQgcmV0dXJuIGZhbHNlLlxuXHRcdGlmICghdGhpcy5TZXRzW3BMZWZ0U2V0TmFtZV1bcExlZnRWYWx1ZV0uaGFzT3duUHJvcGVydHkocFJpZ2h0U2V0TmFtZSkpXG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0cmV0dXJuIHRoaXMuU2V0c1twTGVmdFNldE5hbWVdW3BMZWZ0VmFsdWVdW3BSaWdodFNldE5hbWVdLmhhc093blByb3BlcnR5KHBSaWdodFNldFZhbHVlKTtcblx0fVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb25zdHJhaW50aWZ5OyJdfQ==
