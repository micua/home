# Micua Home

## Install
- npm i babel-core babel-preset-es2015 browser-sync del gulp gulp-autoprefixer gulp-cache gulp-cssnano gulp-eslint gulp-gh-pages gulp-htmlmin gulp-if gulp-imagemin gulp-load-plugins gulp-plumber gulp-reversion gulp-sass gulp-size gulp-sourcemaps gulp-uglify gulp-useref main-bower-files wiredep --save-dev



- npm i browser-sync del gulp gulp-autoprefixer gulp-cache gulp-cssnano gulp-eslint gulp-gh-pages gulp-htmlmin gulp-if gulp-imagemin gulp-load-plugins gulp-plumber gulp-reversion gulp-sass gulp-size gulp-sourcemaps gulp-uglify gulp-useref main-bower-files wiredep --save-dev



var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var Buffer = require('buffer').Buffer;
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var map = require('event-stream').map;

var FILE_DECL = /(href=|src=|url\()(['|"])([^\s>"'.]+?(\.css|\.js|\.png|\.gif|\.jpeg|\.jpg))(['|"])/gi;

var revPlugin = function revPlugin() {

  return map(function(file, cb) {

    var contents;
    var lines;
    var i, length;
    var line;
    var groups;
    var dependencyPath;
    var data, hash;

    if (!file) {
      throw new PluginError('gulp-rev-append', 'Missing file option for gulp-rev-append.');
    }

    if (!file.contents) {
      throw new PluginError('gulp-rev-append', 'Missing file.contents required for modifying files using gulp-rev-append.');
    }

    contents = file.contents.toString();
    lines = contents.split('\n');
    length = lines.length;

    for (i = 0; i < length; i++) {
      line = lines[i];
      groups = FILE_DECL.exec(line);
      if (groups && groups.length > 1) {
        // are we an "absoulte path"? (e.g. /js/app.js)
        var normPath = path.normalize(groups[3]);
        if (normPath.indexOf(path.sep) === 0) {
          dependencyPath = path.join(file.base, normPath);
        } else {
          dependencyPath = path.resolve(path.dirname(file.path), normPath);
        }

        try {
          data = fs.readFileSync(dependencyPath);
          hash = crypto.createHash('md5');
          hash.update(data.toString(), 'utf8');
          line = line.replace(groups[4], groups[4] + '?v=' + hash.digest('hex'));
          console.log(line);
        } catch (e) {
          // fail silently.
          console.log(e);
        }
      }
      lines[i] = line;
      FILE_DECL.lastIndex = 0;
    }
    file.contents = new Buffer(lines.join('\n'));
    cb(null, file);

  });

};

module.exports = revPlugin;

