"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var util = require("util");
var file_1 = require("./file");
var StackOutputPlugin = /** @class */ (function () {
    function StackOutputPlugin(serverless, options) {
        this.serverless = serverless;
        this.options = options;
        this.hooks = {
            'after:deploy:deploy': this.process.bind(this)
        };
        this.output = this.serverless.service.custom.output;
    }
    Object.defineProperty(StackOutputPlugin.prototype, "file", {
        get: function () {
            return this.getConfig('file');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StackOutputPlugin.prototype, "handler", {
        get: function () {
            return this.getConfig('handler');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StackOutputPlugin.prototype, "stackName", {
        get: function () {
            return util.format('%s-%s', this.serverless.service.getServiceName(), this.serverless.getProvider('aws').getStage());
        },
        enumerable: true,
        configurable: true
    });
    StackOutputPlugin.prototype.hasConfig = function (key) {
        return !!this.output && !!this.output[key];
    };
    StackOutputPlugin.prototype.hasHandler = function () {
        return this.hasConfig('handler');
    };
    StackOutputPlugin.prototype.hasFile = function () {
        return this.hasConfig('file');
    };
    StackOutputPlugin.prototype.getConfig = function (key) {
        return util.format('%s/%s', this.serverless.config.servicePath, this.output[key]);
    };
    StackOutputPlugin.prototype.callHandler = function (data) {
        var splits = this.handler.split('.');
        var func = splits.pop() || '';
        var file = splits.join('.');
        require(file)[func](data, this.serverless, this.options);
        return Promise.resolve();
    };
    StackOutputPlugin.prototype.saveFile = function (data) {
        var f = new file_1.default(this.file, this.output.format);
        return f.save(data);
    };
    StackOutputPlugin.prototype.fetch = function () {
        return this.serverless.getProvider('aws').request('CloudFormation', 'describeStacks', { StackName: this.stackName }, this.serverless.getProvider('aws').getStage(), this.serverless.getProvider('aws').getRegion());
    };
    StackOutputPlugin.prototype.beautify = function (data) {
        var stack = data.Stacks.pop() || { Outputs: [] };
        var output = stack.Outputs || [];
        return output.reduce(function (obj, item) {
            return (Object.assign(obj, (_a = {}, _a[item.OutputKey] = item.OutputValue, _a)));
            var _a;
        }, {});
    };
    StackOutputPlugin.prototype.handle = function (data) {
        return Promise.all([
            this.handleHandler(data),
            this.handleFile(data)
        ]);
    };
    StackOutputPlugin.prototype.handleHandler = function (data) {
        var _this = this;
        return this.hasHandler() ? (this.callHandler(data).then(function () { return _this.serverless.cli.log(util.format('Stack Output processed with handler: %s', _this.output.handler)); })) : Promise.resolve();
    };
    StackOutputPlugin.prototype.handleFile = function (data) {
        var _this = this;
        return this.hasFile() ? (this.saveFile(data).then(function () { return _this.serverless.cli.log(util.format('Stack Output saved to file: %s', _this.output.file)); })) : Promise.resolve();
    };
    StackOutputPlugin.prototype.validate = function () {
        assert(this.serverless, 'Invalid serverless configuration');
        assert(this.serverless.service, 'Invalid serverless configuration');
        assert(this.serverless.service.provider, 'Invalid serverless configuration');
        assert(this.serverless.service.provider.name, 'Invalid serverless configuration');
        assert(this.serverless.service.provider.name === 'aws', 'Only supported for AWS provider');
        assert(this.options && !this.options.noDeploy, 'Skipping deployment with --noDeploy flag');
    };
    StackOutputPlugin.prototype.process = function () {
        var _this = this;
        Promise.resolve()
            .then(function () { return _this.validate(); }).then(function () { return _this.fetch(); }).then(function (res) { return _this.beautify(res); }).then(function (res) { return _this.handle(res); }).catch(function (err) { return _this.serverless.cli.log(util.format('Cannot process Stack Output: %s!', err.message)); });
    };
    return StackOutputPlugin;
}());
exports.default = StackOutputPlugin;
