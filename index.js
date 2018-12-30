var _ =       require ('lodash');
var request = require ('superagent');


//////////////////////////////////////////////
// gets data from mongodb. Both url, coll and id are templated
function _from_url (utils, url_tmpl, opts, cfg_so_far, cb) {
  var vals = {
    env: process.env.NODE_ENV || 'development'
  };

  _.merge (vals, cfg_so_far);

  var url = utils.interpolator.parse (url_tmpl, vals);
  
  request
  .get(url) 
  .accept('json')
  .then(function(res) {
    // check if it's json
    if (res.headers['content-type'].split(';')[0] != 'application/json') {
      return cb ('result from url config [' + url + '] is not JSON (but ' + res.headers['content-type'] + ')');
    }

    var obj = {};
    if (opts && opts.mount) _.set (obj, opts.mount, res.body);
    else if (res.body) obj = res.body;
    utils.expand (obj, cfg_so_far, cb);
  })
  .catch(function(err) {
    if (opts && opts.ignore_missing && (err.status == 404)) {
      return cb (null, {});
    }
    else {
      return cb (err);
    }
  });
}


//////////////////////////////////////////////
function __cc_url (url_tmpl, opts) {
  var self = this;
  var utils = {
    interpolator: self._interpolator,
    expand:       self._expand
  };

  this._tasks.push (function (cb) {
    _from_url (utils, url_tmpl, opts, self._cfg, function (err, res) {
      if (err) return cb (err);
      self._merge (res);
      return cb ();
    });
  });

  return this;
}


//////////////////////////////////////////////
module.exports = function (CC) {
  CC.prototype.url = __cc_url;
  return CC;
}