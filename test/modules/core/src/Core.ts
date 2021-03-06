///<reference path="../../../globals.ts" />
///<reference path="../../../tsdHelper.ts" />
///<reference path="../../../../src/tsd/Core.ts" />
///<reference path="../../../../src/tsd/select/Query.ts" />

describe('Core', () => {
	'use strict';

	var fs = require('fs');
	var path = require('path');
	var assert:Chai.Assert = require('chai').assert;

	var core:tsd.Core;
	var context:tsd.Context;

	function getCore(context:tsd.Context):tsd.Core {
		var core = new tsd.Core(context);

		helper.applyCoreUpdate(core);
		return core;
	}

	function testConfig(path:string):Q.Promise<void> {
		context.paths.configFile = path;
		var source = xm.FileUtil.readJSONSync(path);

		core = getCore(context);
		return core.config.readConfig(false).then(() => {
			helper.assertConfig(core.context.config, source, 'source data');
		});
	}

	function testInvalidConfig(path:string, exp:RegExp):Q.Promise<void> {
		context.paths.configFile = path;
		core = getCore(context);
		return assert.isRejected(core.config.readConfig(false), exp);
	}

	before(() => {
	});
	beforeEach(() => {
		context = helper.getContext();
		context.config.log.enabled = false;
		context.paths.configFile = './test/fixtures/config/default.json';
	});
	afterEach(() => {
		context = null;
		core = null;
	});

	it('should be defined', () => {
		assert.isFunction(tsd.Core, 'constructor');
	});
	it('should throw on bad params', () => {
		assert.throws(() => {
			core = getCore(null);
		});
	});

	describe('readConfig', () => {
		//TODO use the actual default
		it('should load default config data', () => {
			return testConfig('./test/fixtures/config/default.json');
		});
		it('should load minimal config data', () => {
			return testConfig('./test/fixtures/config/valid-minimal.json');
		});

		it('should fail on missing required data', () => {
			return testInvalidConfig('./non-existing_____/tsd-json', /^cannot locate file:/);
		});
		it('should fail on bad version value', () => {
			return testInvalidConfig('./test/fixtures/config/invalid-version.json', /^malformed config:/);
		});

		it('should pass on missing optional data', () => {
			context.paths.configFile = './non-existing_____/tsd.json';
			core = getCore(context);
			return assert.isFulfilled(core.config.readConfig(true));
		});
	});
	describe('saveConfig', () => {
		it('should save modified data', () => {
			//copy temp for saving
			var saveFile = path.resolve(__dirname, 'save-config.json');
			fs.writeFileSync(saveFile, fs.readFileSync('./test/fixtures/config/valid.json', {encoding: 'utf8'}), {encoding: 'utf8'});
			context.paths.configFile = saveFile;

			core = getCore(context);
			//core.verbose = true;

			//modify test data
			var source = xm.FileUtil.readJSONSync(saveFile);
			var changed = xm.FileUtil.readJSONSync(saveFile);

			changed.path = 'some/other/path';
			changed.installed['bleh/blah.d.ts'] = changed.installed['async/async.d.ts'];
			delete changed.installed['async/async.d.ts'];

			return core.config.readConfig(false).then(() => {
				helper.assertConfig(core.context.config, source, 'core.context.config');

				//modify data
				core.context.config.path = 'some/other/path';
				core.context.config.getInstalled()[0].path = 'bleh/blah.d.ts';

				return core.config.saveConfig();
			}).then(() => {
				assert.notIsEmptyFile(context.paths.configFile);
				return xm.FileUtil.readJSONPromise(context.paths.configFile);
			}).then((json) => {
				assert.like(json, changed, 'saved data json');
				assert.jsonSchema(json, helper.getConfigSchema(), 'saved valid json');
				return null;
			});
		});
	});

	describe('updateIndex', () => {
		it.eventually('should return data', () => {
			core = getCore(context);
			//core.verbose = true;

			return core.index.getIndex().then((index:tsd.DefIndex) => {
				assert.isTrue(index.hasIndex(), 'index.hasIndex');
				assert.operator(index.list.length, '>', 200, 'index.list');
				//xm.log(index.toDump());
				//TODO validate index data
				return null;
			});
		});
	});
});
