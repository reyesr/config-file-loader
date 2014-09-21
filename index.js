var fs = require("fs");
var path = require('path');
var yaml = require("js-yaml");

function loadYaml(path) {
    return yaml.safeLoad(fs.readFileSync(path, 'utf8'));
}

function loadJson(path) {
    var content = fs.readFileSync(path, "utf8");
    return content?JSON.parse(content):{};
}

function loadConfigFile(filePath, defaultLoaderName) {
    defaultLoaderName = defaultLoaderName || "yaml";
    var extension = path.extname(filePath);
    try {
        switch (extension) {
            case ".json":
            case ".js":
                return loadJson(filePath);
                break;
            case ".yaml":
                return loadYaml(filePath);
                break;
            default:
                var loaders = (defaultLoaderName === "yaml") ? [loadYaml, loadJson] : [loadJson, loadYaml];
                for (var i = 0; i < loaders.length; i += 1) {
                    try {
                        return loaders[i](filePath);
                    } catch (exc) {
                        // ignore
                    }
                }
                throw new Error();
                break;
        }
    } catch (exc) {
        throw new Error("Invalid format for " + filePath);
    }
}

function ensureArray(data) {
    return Array.isArray(data)?data:[data];
}

function home() {
    return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
}

function loader(defaultConfig) {

    if (!(this instanceof  loader)) {
        return new loader(defaultConfig);
    }
    var currentDirectoryPhony = {};
    this.home = home();
    this.cwd = process.cwd();

    this.config = defaultConfig || {};
    this.config.paths = this.config.paths || [currentDirectoryPhony, this.home];
    this.config.extensions = this.config.extensions || ["", ".json", ".yaml"];
    this.config.appName = this.config.appName || "config";

    var defaultConfigData = undefined;
    var saveIfNotFound = false;
    var preferredFormat = "yaml";

    this.get = function(configName) {
        configName = configName || this.config.appName;
        var self = this;
        var locations = [];
        ensureArray(this.config.paths).forEach(function(prefix) {
            prefix = prefix === currentDirectoryPhony ? undefined : prefix;
            ensureArray(self.config.extensions).forEach(function(extension) {
                extension = extension?extension:"";
                ensureArray(configName).forEach(function(basename) {
                    locations.push(prefix?path.join(prefix, basename + extension) : basename + extension);
                    locations.push(prefix?path.join(prefix, "." + basename + extension) : "." + basename + extension);
                });
            });
        });
        var defaultLocation = locations.length>0?locations[0]:undefined;
        var file = locations.filter(function(path) {
            return fs.existsSync(path);
        }).reduce(function(left,right) {
            return left?left:right;
        }, undefined);

        try {
            return loadConfigFile(file, preferredFormat);
        } catch (err) {
            if (defaultConfigData) {
                // save
                if (defaultLocation && saveIfNotFound) {
                    this.saveConfig(defaultLocation, defaultConfigData, preferredFormat);
                }
                return defaultConfigData;
            }
            return {};
        }
    }

    this.setDefault = function(object) {
        defaultConfigData = object;
        return this;
    }

    this.setPaths = function(paths) {
        this.config.paths = paths;
        return this;
    }

    this.setSuffixes = function(extensions) {
        this.config.extensions = extensions;
        return this;
    }

    this.setAppName = function(appName) {
        this.config.appName = appName;
        return this;
    }

    this.setSaveDefaultIfNotFound = function(bval) {
        saveIfNotFound = !!bval;
        return this;
    }


    this.saveConfig = function(location, configObject, preferredFormat) {
        if (fs.existsSync(location)) {
            return false;
        }

        var extension = path.extname(location);
        var format = preferredFormat;
        switch(extension) {
            case ".json":
                format = "json";
                break;
            case "yaml":
                format = "yaml";
                break;
        }
        if (format == "json") {
            fs.writeFileSync(location, JSON.stringify(configObject));
        } else {
            fs.writeFileSync(location, yaml.safeDump(configObject));
        }
        return this;
    }

    this.setPreferredFormat = function(format) {
        preferredFormat = format;
        if (format != "json" && format != "yaml") {
            throw Error("config file preferred format should be either 'json' or 'yaml'");
        }
        return this;
    };

}

exports.Loader = loader;
exports.loadConfigFile = loadConfigFile;
exports.loadYaml = loadYaml;
exports.loadJson = loadJson;
exports.home = home;
