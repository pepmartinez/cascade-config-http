# cascade-config-http
cascade-config loader over http

## Quick Start
`cascade-config-http` adds a loader to `cascade-config` to allow reading from urls. Only `application/json` response bodies are supported.

```javascript
var CC_base = require('cascade-config');
var CC_http = require ('cascade-config-http');
var CC = CC_http (CC_base);

var config = new CC();

config
.obj ({cc: {n: 'ooo'}, x: 0})
.url('mongodb://{env}-config.server.com') 
.done(function (err, cfg) {
  ...
});
```

## API
* `.mongodb (url, opts)`: reads an object as json from an url (which supports variable substitution). opts is optional, and can contain:
  * `ignore_missing`: if the url returnd a 404, produce an empty object. Otherwise, http 404 esponses are treated as errors
  * `mount`: mount result inside this path. For example, if an url returns `{a: 1, b: 3}` and options are `{mount: 'a.b.c}` the result will be `{a: {b: {c: {a: 1, b: 3}}}}`

# Variable expansion
As it happens with standard loaders in `cascade-config` read objects from url are then subject to variable expansion using so-far read config; also, config read by this loader ca