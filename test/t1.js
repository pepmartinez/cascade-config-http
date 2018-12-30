var CC_base = require('cascade-config');
var CC_url = require ('../');
var CC = CC_url (CC_base);

var express = require ('express');
var http =    require ('http');
var async =  require('async');
var _ =      require('lodash');
var should = require('should');

describe('cascade-config-http test', function () {
  var test_server;

  before(function (done) {
    var app = express();
    app.get ('/config/:env/:else', function (req,res) {
      res.send (req.params);
    });
    test_server = http.createServer (app);
    test_server.listen (12345, function () {
      done ();
    });
  });

  after(function (done) {
    test_server.close (done);
  });


  describe('plain, nontemplated', function () {

    it('does read and merge ok', function (done) {
      var mconf = new CC();

      mconf
        .obj({ a: 'b', b: { c: 1, d: 4 } })
        .url ('http://localhost:12345/config/e/a')
        .url ('http://localhost:12345/config/eee/aaa', {mount: 'remote.conf'})
        .done(function (err, cfg) {
          if (err) done (err);
          
          cfg.should.eql({
            a: 'b',
            b: { c: 1, d: 4},
            env: 'e',
            else: 'a',
            remote: { conf: { env: 'eee', else: 'aaa' } }         
          });

          done();
        });
    });

    it('does return empty object on 404 url if ignore_missing is true', function (done) {
      var mconf = new CC();

      mconf.url('http://localhost:12345/nonexistent', {ignore_missing: true})
        .done(function (err, cfg) {
          cfg.should.eql({});
          done();
        });
    });

    it('does return error on 404 url', function (done) {
      var mconf = new CC();

      mconf.url('http://localhost:12345/nonexistent')
        .done(function (err, cfg) {
          should(cfg).be.undefined();
          err.status.should.equal(404);
          done();
        });
    });

  });

  describe('templated', function () {

    it('merges from templatized url ok', function (done) {
      var mconf = new CC();

      mconf
        .obj({ a: 'b', b: { c: 1, d: 4 } })
        .url ('http://localhost:12345/config/{env}/{b.d}', {mount: 'remote.conf'})
        .done(function (err, cfg) {
          if (err) done (err);
          cfg.should.eql({
            a: 'b', 
            b: { c: 1, d: 4 }, 
            remote: { conf: { env: 'development', else: '4' } }
          });

          done();
        });
    });    


  });
});

