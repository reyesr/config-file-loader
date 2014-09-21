config-file-loader
==================

A config file manager that supports json and yaml

Features:

- Loading configuration files in json or yaml
- Configurable lookup path, defaults in current directory and home dir
- Supports multiple extensions and even no extensions at all
- Default configuration object can be returned and/or saved

Basic Usage
-----------

The config loader loads a configuration file based on the application basename provided.
```
    var cfg = require("config-file-loader");   
    var object = new cfg.Loader().get("app");
``` 
In the example above, it searches in the current directory, or in the user home, for a 
file named either "app", or ".app", or "app.json", "app.yaml", ".app.json", ".app.yaml".

The loader defaults with the following parameters:
- lookup folders: current directory, then the user home
- the base name: "app", then ".app"
- the extensions: no extension, then ".json", then ".yaml"

If a file matches any of the combination, it is loaded, parsed, and returned. If multiple files match, it just loads the first one (according to the order discussed above).

Advanced Usage
--------------

* **Defining a default object**: if no config file is found, it returns this object instead
```
    var defaultObject = {name: "value"};
    var object = new cfg.Loader().setDefault(defaultObject).get("app");
```

* **Defining the lookup path** (orderly), with a directory, or an array of directories
```
    var object = new cfg.Loader().setPath(cfg.home).get("app");
```

First user home, then current directory (actually this the default)
```
    var object = new cfg.Loader().setPaths([cfg.home, cfg.cwd]).get("app");
```
Of course, it is possible to use only a single relative folder:
```
    var object = new cfg.Loader().setPaths("config/").get("app");
```
In the example above, the module only searches in the config/ subfolder.

* **Defining the file suffix**
```
    var object = new cfg.Loader().setSuffixes(["", "rc", ".json"]).get("app");
```
This searches for the files "app", ".app", "apprc", ".apprc", "app.json", ".app.json"

* **Creating a file config if it does not exists**: a default configuration file can 
be saved, using the first path loookup combination as filename, if no configuration file
has been found at all. This is handy to create a default file that the user can modify.

```
    var object = new cfg.Loader().setSaveDefaultIfNotFound(true).get("app");
```


LICENCE
-------
```
Copyright 2014 Rodrigo Reyes

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```