"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var StackOutputFile = /** @class */ (function () {
    function StackOutputFile(path, format) {
        this.path = path;
        this.format = format;
    }
    StackOutputFile.prototype.formatData = function (data) {
        var ext = this.path.split('.').pop() || '';
        var format = this.format || ext;
        switch (format.toUpperCase()) {
            case 'JSON':
                return JSON.stringify(data, null, 2);
            case 'TOML':
                return require('tomlify-j0.4')(data, null, 0).replace(/ /g, "");
            case 'YAML':
            case 'YML':
                return require('yamljs').stringify(data);
            default:
                throw new Error('No formatter found for `' + format + '` extension');
        }
    };
    StackOutputFile.prototype.save = function (data) {
        var content = this.formatData(data);
        try {
            fs.writeFileSync(this.path, content);
        }
        catch (e) {
            throw new Error('Cannot write to file: ' + this.path);
        }
        return Promise.resolve();
    };
    return StackOutputFile;
}());
exports.default = StackOutputFile;
