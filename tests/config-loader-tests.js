var path = require("path");
var fs = require("fs");
var config = require("../index");
var tmp = require("tmp");
tmp.setGracefulCleanup();

exports["The array of directories where the config file is loaded is used in the right order"] = function(test) {
    var object = new config.Loader()
        .setPaths(["tests/data/config1", "tests/data/config2", "tests/data/"])
        .setSuffixes([".json", ".yaml"])
        .get("appconfig");
    test.equal(object.content, "config1/appconfig.json");

    var object = new config.Loader()
        .setPaths(["tests/data/config2", "tests/data/config1", "tests/data/"])
        .setSuffixes([".json", ".yaml"])
        .get("appconfig");
    test.equal(object.content, "config2/appconfig.json");

    test.done();
};

exports["Extension array is used in the right order too"] = function(test) {
    var object = new config.Loader()
        .setPaths(["tests/data/config1", "tests/data/config2", "tests/data/"])
        .setSuffixes([".json", ".yaml"])
        .get("appconfig");
    test.equal(object.content, "config1/appconfig.json");

    var object = new config.Loader()
        .setPaths(["tests/data/config1", "tests/data/config2", "tests/data/"])
        .setSuffixes([".yaml", ".json", ])
        .get("appconfig");
    test.equal(object.content, "config1/appconfig.yaml");

    test.done();
};

exports["Appname option as string is used as basename"] = function(test) {
    var object = new config.Loader()
        .setPaths(["tests/data/config1", "tests/data/config2", "tests/data/"]).setSuffixes([".json", ".yaml"])
        .setAppName("foobar")
        .get();
    test.equal(object.content, "config1/foobar.json");

    test.done();
};

exports["Appname option as array of string is used as basename"] = function(test) {
    var object = new config.Loader()
        .setPaths(["tests/data/config1", "tests/data/config2", "tests/data/"]).setSuffixes([".json", ".yaml"])
        .setAppName(["foobar", "appconfig"])
        .get();
    test.equal(object.content, "config1/foobar.json");

    test.done();
};

exports["Get parameter overrides config option"] = function(test) {
    var object = new config.Loader()
        .setPaths(["tests/data/config1", "tests/data/config2", "tests/data/"]).setSuffixes([".json", ".yaml"])
        .setAppName("appconfig")
        .get("foobar");
    test.equal(object.content, "config1/foobar.json");

    test.done();
};

exports["Default object is returned as expected"] = function(test) {
    var defaultObj = {hello:"Hello, World"};
    var object = new config.Loader()
        .setPaths(["tests/data/config1", "tests/data/config2", "tests/data/"]).setSuffixes([".json", ".yaml"])
        .setDefault(defaultObj)
        .get("wrongconfig");
    test.strictEqual(object, defaultObj);
    test.done();
};


exports["loadConfigFile uses file extension if available"] = function(test) {
    test.equal( config.loadConfigFile("tests/data/config2/appconfig.yaml", "json").content, "config2/appconfig.yaml");
    test.equal( config.loadConfigFile("tests/data/config2/appconfig.yaml", "yaml").content, "config2/appconfig.yaml");
    test.equal( config.loadConfigFile("tests/data/config2/appconfig.json", "json").content, "config2/appconfig.json");
    test.equal( config.loadConfigFile("tests/data/config2/appconfig.json", "yaml").content, "config2/appconfig.json");
    test.equal( config.loadConfigFile("tests/data/config2/appconfig.json").content, "config2/appconfig.json");
    test.equal( config.loadConfigFile("tests/data/config2/appconfig.json").content, "config2/appconfig.json");

    test.done();
};

exports["loadConfigFile works fine even when no default type is provided"] = function(test) {
    test.equal( config.loadConfigFile("tests/data/config2/appconfig.json").content, "config2/appconfig.json");
    test.equal( config.loadConfigFile("tests/data/config2/appconfig.yaml").content, "config2/appconfig.yaml");
    test.done();
};

exports["File loader accepts json/yaml type parameters and works even if they are wrong"] = function(test) {
    test.equal( config.loadConfigFile("tests/data/config2/appconfig").content, "config2/appconfig");
    test.equal( config.loadConfigFile("tests/data/config2/appconfig", "yaml").content, "config2/appconfig");
    test.equal( config.loadConfigFile("tests/data/config2/appconfig", "json").content, "config2/appconfig");

    test.equal( config.loadConfigFile("tests/data/config1/appconfig").content, "config1/appconfig");
    test.equal( config.loadConfigFile("tests/data/config1/appconfig", "yaml").content, "config1/appconfig");
    test.equal( config.loadConfigFile("tests/data/config1/appconfig", "json").content, "config1/appconfig");

    test.done();
};

exports["Default object is saved when it does not exist (yaml flavour)"] = function(test) {
    var defaultObj = {hello:"Hello, World"};
    tmp.dir(function(err, configpath) {
        var object = new config.Loader()
            .setPaths(configpath)
            .setDefault(defaultObj)
            .setPreferredFormat("yaml")
            .setSaveDefaultIfNotFound(true)
            .get("wrongconfig");

        test.strictEqual(object, defaultObj);
        test.equal(object.hello, "Hello, World");
        test.ok( fs.existsSync(path.join(configpath, "wrongconfig")))

        var checkContent = fs.readFileSync(path.join(configpath, "wrongconfig"), "utf8");
        test.equal(checkContent.trim(), 'hello: "Hello, World"');
        test.done();
    });
};

exports["Default object is saved when it does not exist (json flavour)"] = function(test) {
    var defaultObj = {hello:"Hello, World"};
    tmp.dir(function(err, configpath) {
        var object = new config.Loader()
            .setPaths(configpath)
            .setDefault(defaultObj)
            .setPreferredFormat("json")
            .setSaveDefaultIfNotFound(true)
            .get("wrongconfig");

        test.strictEqual(object, defaultObj);
        test.equal(object.hello, "Hello, World");
        test.ok( fs.existsSync(path.join(configpath, "wrongconfig")))

        var checkContent = fs.readFileSync(path.join(configpath, "wrongconfig"), "utf8");
        test.equal(checkContent.trim(), '{"hello":"Hello, World"}');
        test.done();
    });
};
