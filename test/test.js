'use strict';

require('mocha');
var fs = require('fs');
var path = require('path');
var File = require('vinyl');
var assert = require('assert');
var contents = require('../');

describe('gulp-contents', function() {
  it('sanity check', function() {
    assert.equal(typeof contents, 'function');
  });

  it('should return an object', function() {
    assert(contents());
    assert.equal(typeof contents(), 'object');
    assert.equal(typeof contents().pipe, 'function');
  });

  it('should take a relative path', function(cb) {
    unit({contents: 'fixtures/foo.hbs'}, {}, function(err, file) {
      if (err) {
        cb(err);
        return;
      }
      assert(file);
      assert(file.contents);
      assert.equal(file.contents.toString(), 'This is foo');
      cb();
    });
  });

  it('should take a cwd on options', function(cb) {
    unit({contents: 'foo.hbs'}, {cwd: path.join(__dirname, 'fixtures')}, function(err, file) {
      if (err) {
        cb(err);
        return;
      }
      assert(file);
      assert(file.contents);
      assert.equal(file.contents.toString(), 'This is foo');
      cb();
    });
  });

  it('should take a resolve function on options', function(cb) {
    var opts = {
      resolve: function(file, options, next) {
        var fp = path.join(__dirname, 'fixtures', file.data.contents);
        file.contents = fs.readFileSync(fp);
        next(null, file);
      }
    };

    unit({contents: 'foo.hbs'}, opts, function(err, file) {
      if (err) {
        cb(err);
        return;
      }
      assert(file);
      assert(file.contents);
      assert.equal(file.contents.toString(), 'This is foo');
      cb();
    });
  });
});

function unit(data, options, cb) {
  var stream = contents(options);
  var buffer;

  stream.write(new File({
    base: __dirname,
    path: 'faux.txt',
    data: data,
    contents: null
  }));

  stream.on('error', cb);
  stream.on('data', function(file) {
    buffer = file;
  });

  stream.on('end', function() {
    cb(null, buffer);
  });

  stream.end();
}
