/**
* Unit tests for Constraintify
*
* @license     MIT
*
* @author      Steven Velozo <steven@velozo.com>
*/

var Chai = require("chai");
var Expect = Chai.expect;
var Assert = Chai.assert;
var libConstraintify = require('../source/Constraintify.js');


var _MockSettings = (
{
	Product: 'Constraintify Test',
	ProductVersion: '0.0.0'
});

suite
(
	'Basic',
	()=>
	{
		setup(()=>{});

		suite
		(
			'Object Sanity',
			()=>
			{
				test
				(
					'The class should initialize itself into a happy little object.',
					(fDone)=>
					{
						var testScope = {};
						var testConstraintify = new libConstraintify(_MockSettings, testScope);
						Expect(testConstraintify).to.be.an('object', 'Constraintify should initialize as an object directly from the require statement.');
						Expect(testConstraintify._Settings)
							.to.be.a('object');
						fDone();
					}
				);
				test
				(
					'Try with a global scope...',
					(fDone)=>
					{
						var testConstraintify = new libConstraintify(_MockSettings);
						Expect(testConstraintify).to.be.an('object', 'Constraintify should initialize as an object directly from the require statement.');
						fDone();
					}
				);
				test
				(
					'Initialize with some basic settings',
					(fDone)=>
					{
						var testConstraintify = new libConstraintify(
							{
								Server:'https://my.server.com/1.0/',
								Entity:'Animal',
								Cached:false
							});
						Expect(testConstraintify).to.be.an('object', 'Constraintify should initialize as an object directly from the require statement.');
						Expect(testConstraintify._Settings.Entity)
							.to.equal('Animal');
						Expect(testConstraintify._Settings.Server)
							.to.equal('https://my.server.com/1.0/');
						fDone();
					}
				)
			}
		);
		suite
		(
			'Logging Tests',
			()=>
			{
				test
				(
					'Each log channel should work.',
					(fDone)=>
					{
						var testScope = {};
						var testConstraintify = new libConstraintify(_MockSettings, testScope);

						var tmpTestStart = testConstraintify.log.getTimeStamp();

						Expect(testConstraintify.log)
							.to.be.a('object');
						testConstraintify.log.trace('Test 1');
						testConstraintify.log.debug('Test 2');
						testConstraintify.log.info('Test 3');
						testConstraintify.log.warning('Test 4');
						testConstraintify.log.error('Test 5');


						testConstraintify.log.logTimeDelta(tmpTestStart);

						// Test time logging
						testConstraintify.log.logTime();
						testConstraintify.log.logTimeDelta(tmpTestStart);

						testConstraintify.log.logTime('Custom Timestamp Message');
						testConstraintify.log.logTimeDelta(tmpTestStart);

						// Exercise object logging
						testConstraintify.log.debug('Settings: ', testConstraintify.settings);

						testConstraintify.log.logTimeDelta(tmpTestStart, 'Test Complete');

						fDone();
					}
				);
			}
		);
	}
);