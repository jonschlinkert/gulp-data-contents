'use strict';

var fs = require('fs');
var path = require('path');
var expand = require('expand-tilde');
var isBinary = require('file-is-binary');
var through = require('through2');
var get = require('get-value');

module.exports = function(options) {
  var opts = Object.assign({prop: 'data.contents'}, options);
  return through.obj(function(file, enc, next) {
    if (file.isDirectory() || isBinary(file)) {
      next(null, file);
      return;
    }

    if (typeof get(file, opts.prop) !== 'string') {
      next(null, file);
      return;
    }

    if (typeof opts.resolve === 'function') {
      opts.resolve(file, opts, next);
      return;
    }

    resolve(file, opts, function(err, filepath) {
      if (err) {
        next(err);
        return;
      }

      if (fs.existsSync(filepath)) {
        file.contents = fs.readFileSync(filepath);
      }

      next(null, file);
    });
  });
};

function resolve(file, options, next) {
  var filename = get(file, options.prop);
  var cwd = expand(options.cwd || file.base);
  next(null, path.resolve(cwd, filename));
}
