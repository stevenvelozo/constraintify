/**
* @license MIT
* @author <steven@velozo.com>
*/

/**
* Constraintify Graph Traversal Library
*
* @class Constraintify
*/
class Constraintify
{
	constructor(pSettings)
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
	}

	addSet(pSetName)
	{
		if (this.Sets.hasOwnProperty(pSetName))
		{
			if (this._Settings.DebugLogNoisy) this.log.warning('Attempted to add set ['+pSetName+'] but it already exists.');
			return false;
		}
		if (this._Settings.DebugLog) this.log.info('Adding set ['+pSetName+'].');

		this.Sets[pSetName] = {};
		return true;
	}

	addSetValue(pSetName, pValue)
	{
		if(!this.Sets.hasOwnProperty(pSetName))
		{
			if (this._Settings.DebugLog) this.log.warning('Attempted to add value ['+pValue+'] to set ['+pSetName+'] but set does not exist.  Adding set now.');
			this.addSet(pSetName);
		}

		if (this.Sets[pSetName].hasOwnProperty(pValue))
		{
			if (this._Settings.DebugLogNoisy) this.log.warning('Attempted to add DUPLICATE value ['+pValue+'] to set ['+pSetName+'] but value is already in set.');
			return false;
		}

		if (this._Settings.DebugLog) this.log.info('Adding value ['+pValue+'] to set ['+pSetName+'].');
		this.Sets[pSetName][pValue] = {};
	}

	addSetConnection(pSetName, pValue, pConnectedSet)
	{
		this.addSetValue(pSetName, pValue);

		if (this.Sets[pSetName][pValue].hasOwnProperty(pConnectedSet))
		{
			if (this._Settings.DebugLogNoisy) this.log.info('Set ['+pSetName+']->['+pValue+'] already connected to set ['+pConnectedSet+'].');
			return false;
		}

		if (this._Settings.DebugLog) this.log.info('Connecting Set ['+pSetName+']->['+pValue+'] to set ['+pConnectedSet+'].');
		this.Sets[pSetName][pValue][pConnectedSet] = {};
	}

	connectSetValue(pLeftSetName, pLeftValue, pRightSetName, pRightValue)
	{
		this.addSet(pLeftSetName);
		this.addSet(pRightSetName);
		this.addSetValue(pLeftSetName, pLeftValue);
		this.addSetValue(pRightSetName, pRightValue);
		this.addSetConnection(pLeftSetName, pLeftValue, pRightSetName);

		this.Sets[pLeftSetName][pLeftValue][pRightSetName][pRightValue] = true;
	}

	addSetValueConnection(pLeftSetName, pLeftValue, pRightSetName, pRightValue)
	{
		this.addSet(pLeftSetName);
		this.addSet(pRightSetName);

		this.addSetValue(pLeftSetName, pLeftValue);
		this.addSetValue(pRightSetName, pRightValue);

		this.connectSetValue(pLeftSetName, pLeftValue, pRightSetName, pRightValue);
	}

	addSetValueConnectionBidirectional(pLeftSetName, pLeftValue, pRightSetName, pRightValue)
	{
		this.addSetValueConnection(pLeftSetName, pLeftValue, pRightSetName, pRightValue);
		this.addSetValueConnection(pRightSetName, pRightValue, pLeftSetName, pLeftValue);
	}

	getSetValues(pLeftSetName)
	{
		// If the set doesn't exist, return empty
		if (!this.Sets.hasOwnProperty(pLeftSetName))
		{
			return [];
		}
		return Object.keys(this.Sets[pLeftSetName]);
	}

	getSetConnectedValues(pLeftSetName, pLeftValue, pRightSetName)
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
	}

	checkSetValue(pLeftSetName, pLeftValue)
	{
		if (!this.Sets.hasOwnProperty(pLeftSetName))
			return false;
		return this.Sets[pLeftSetName].hasOwnProperty(pLeftValue);
	}

	checkSetConnectedValue(pLeftSetName, pLeftValue, pRightSetName, pRightSetValue)
	{
		// If the set doesn't exist, return false
		if (!this.Sets.hasOwnProperty(pLeftSetName))
			return false;
		// If this value isn't in the set return false.
		if (!this.Sets[pLeftSetName].hasOwnProperty(pLeftValue))
			return false;
		// If this value isn't connected to the right set return false.
		if (!this.Sets[pLeftSetName][pLeftValue].hasOwnProperty(pRightSetName))
			return false;
		return this.Sets[pLeftSetName][pLeftValue][pRightSetName].hasOwnProperty(pRightSetValue);
	}
};

module.exports = Constraintify;