var through = require('through2');
var lodash = require('lodash');
var DockerJs = require('docker');
var path = require('path');

module.exports = function(opt) {
  var docker = function(file, encoding, cb) {
    var opts = {
      inDir: file.path,
      outDir: path.join(file.path, 'docs'),
      onlyUpdated: true,
      exclude: '*dist*,*vendors*,*bower_components*,*coverage*,*node_modules*,*test*,.git,docs,*.jade,*.min.js,*templates.js,*.conf.js,*.css,*.html,*estCase.js,*.md,*demo*',
      lineNums: true
    };
    var dockerJs = new DockerJs(opts);
    dockerJs.doc(['./']);
    var checkIfRunning = function() {
      if (dockerJs.running) {
        lodash.delay(checkIfRunning, 100);
      } else {
        cb(null);
      }
    };
    lodash.delay(checkIfRunning, 100);
  };

  return through.obj(docker);
};
