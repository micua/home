/*
 * @Author: iceStone
 * @Date:   2015-08-31 11:40:15
 * @Last Modified by:   iceStone
 * @Last Modified time: 2015-12-30 22:10:58
 */
'use strict';

const gulp = require("gulp");
const gulpLoadPlugins = require("gulp-load-plugins");
const del = require("del");

const bs = require("browser-sync").create();
const wiredep = require("wiredep").stream;

const plugins = gulpLoadPlugins();

gulp.task('styles', () => {
  return gulp.src('src/styles/*.scss')
    .pipe(plugins.plumber())
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      // includePaths: ['']
    }).on('error', plugins.sass.logError))
    // .pipe(plugins.autoprefixer({
    //   browsers: ['last 2 version']
    // }))
    .pipe(plugins.sourcemaps.write('.'))
    .pipe(gulp.dest('temp/styles'))
    .pipe(bs.stream({ match: "**/*.css" }));
});

function lint(files, options) {
  return () => {
    return gulp.src(files)
      .pipe(bs.reload({
        stream: true,
        once: true
      }))
      .pipe(plugins.eslint(options))
      .pipe(plugins.eslint.format())
      .pipe(plugins.if(!bs.active, plugins.eslint.failAfterError()));
  };
}
const testLintOptions = {
  env: {
    mocha: true
  }
};

gulp.task('lint', lint('src/scripts/**/*.js'));

gulp.task('lint:test', lint('test/spec/**/*.js', testLintOptions));

gulp.task('html', ['styles'], () => {
  return gulp.src('src/*.html')
    .pipe(plugins.useref({
      searchPath: ['temp', 'src', '.']
    }))
    .pipe(plugins.if('*.js', plugins.uglify()))
    .pipe(plugins.if('*.css', plugins.cssnano({
      compatibility: '*'
    })))
    .pipe(gulp.dest('dist'));
});

gulp.task('reversion', ['html'], () => {
  return gulp.src('dist/*.html')
    .pipe(plugins.reversion())
    .pipe(plugins.if('*.html', plugins.htmlmin({
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeAttributeQuotes: true,
      removeComments: true,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
    })))
    .pipe(gulp.dest('dist'));
});

gulp.task('images', () => {
  return gulp.src('src/images/**/*')
    .pipe(plugins.if(plugins.if.isFile, plugins.cache(plugins.imagemin({
        progressive: true,
        interlaced: true,
        // don't remove IDs from SVGs, they are often used
        // as hooks for embedding and styling
        svgoPlugins: [{
          cleanupIDs: false
        }]
      }))
      .on('error', function(err) {
        console.log(err);
        this.end();
      })))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', () => {
  return gulp.src(require('main-bower-files')({
      filter: '**/*.{eot,svg,ttf,woff,woff2,otf}'
    }).concat('src/fonts/**/*'))
    .pipe(gulp.dest('temp/fonts'))
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('extras', () => {
  return gulp.src([
    'src/*',
    'src/*.*',
    '!src/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('clean', del.bind(null, ['temp', 'dist', '.publish']));

gulp.task('serve', ['styles', 'fonts'], () => {
  bs.init({
    notify: false,
    port: 2015,
    server: {
      baseDir: ['temp', 'src'],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch([
    'src/*.html',
    'src/scripts/**/*.js',
    'src/images/**/*',
    'temp/fonts/**/*'
  ]).on('change', bs.reload);

  gulp.watch('src/styles/**/*.scss', ['styles']);
  gulp.watch('src/fonts/**/*', ['fonts']);
  gulp.watch('bower.json', ['wiredep', 'fonts']);
});

gulp.task('serve:dist', () => {
  bs.init({
    notify: false,
    port: 2015,
    server: {
      baseDir: ['dist']
    }
  });
});

gulp.task('serve:test', () => {
  bs.init({
    notify: false,
    port: 2015,
    ui: false,
    server: {
      baseDir: 'test',
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch('test/spec/**/*.js').on('change', bs.reload);
  gulp.watch('test/spec/**/*.js', ['lint:test']);
});

// inject bower components
gulp.task('wiredep', () => {
  gulp.src(['src/styles/*.scss', '!src/styles/_*.scss'])
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)+/
    }))
    .pipe(gulp.dest('./src/styles'));
  gulp.src('./src/*.html')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('./src'));
});

gulp.task('build', ['lint', 'reversion', 'images', 'fonts', 'extras'], () => {
  return gulp.src('dist/**/*').pipe(plugins.size({
    title: 'build',
    gzip: true
  }));
});

gulp.task('deploy', () => {
  return gulp.src('dist/**/*')
    .pipe(plugins.ghPages());
});

gulp.task('default', ['clean'], () => {
  gulp.start('build');
});
