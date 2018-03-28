'use strict';

var gulp = require('gulp');
var eslint = require('gulp-eslint');
var htmlExtract = require('gulp-html-extract');
var stylelint = require('gulp-stylelint');
const rollup = require('rollup');
const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');
const license = require('rollup-plugin-license');
const path = require('path');
const del = require('del');
const rename = require('gulp-rename');
const { exec } = require('child_process');
const size = require('gulp-size');
const runSequence = require('run-sequence');

gulp.task('lint', ['lint:js', 'lint:html', 'lint:css']);

gulp.task('lint:js', function() {
  return gulp.src([
    '*.js',
    'test/**/*.js'
  ])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError('fail'));
});

gulp.task('lint:html', function() {
  return gulp.src([
    '*.html',
    'src/**/*.html',
    'demo/**/*.html',
    'test/**/*.html'
  ])
    .pipe(htmlExtract({
      sel: 'script, code-example code',
      strip: true
    }))
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError('fail'));
});

gulp.task('lint:css', function() {
  return gulp.src([
    '*.html',
    'src/**/*.html',
    'demo/**/*.html',
    'theme/**/*.html',
    'test/**/*.html'
  ])
    .pipe(htmlExtract({
      sel: 'style'
    }))
    .pipe(stylelint({
      reporters: [
        {formatter: 'string', console: true}
      ]
    }));
});

gulp.task('path-to-regexp', () => {
  return rollup.rollup({
    input: 'path-to-regexp.js',
    plugins: [
      resolve(),
      commonjs(),
      license({
        banner: {
          file: path.join(__dirname, './node_modules/path-to-regexp/LICENSE')
        }
      })
    ]
  }).then(bundle => {
    return bundle.write({
      file: 'lib/path-to-regexp.js',
      format: 'iife',
      name: 'PathToRegexp'
    });
  });
});

// Size control: shows the size of the minified vaadin-router bundle in different scenarios:
//  - for an app that already uses all parts of Polymer 2
//  - for an app that already the most common parts of Polymer 2
//  - for an app that does not use Polymer 2 at all
//
// run: `gulp size-control`
// Sample output:
//            ...
// [15:08:43] full-polymer app-shell.html 121 kB
// [15:08:43] full-polymer vaadin-router-bundle.html 8.61 kB
//            ...
// [15:08:50] some-polymer app-shell.html 78.4 kB
// [15:08:50] some-polymer vaadin-router-bundle.html 8.61 kB
//            ...
// [15:08:57] no-polymer app-shell.html 39 B
// [15:08:57] no-polymer vaadin-router-bundle.html 57.7 kB

const sizeControlShells = ['full-polymer', 'some-polymer', 'no-polymer'];
const sizeControlTasks = [];

gulp.task('size-control', (done) => {
  runSequence(...sizeControlTasks);
});

for (const shell of sizeControlShells) {
  gulp.task(`size-control:${shell}:copy-sources`, ['size-control:clean'], () => {
    return gulp.src(
      [
        `size-control/index.html`,
        `size-control/app-shell-${shell}.html`,
        `size-control/vaadin-router-bundle.html`
      ])
      .pipe(rename((path) => {
        if (path.basename.indexOf('app-shell-') === 0) {
          path.basename = 'app-shell';
        }
      }))
      .pipe(gulp.dest(`build/size-control`));
  });

  gulp.task(`size-control:${shell}:polymer-config`, ['size-control:clean'], () => {
    return gulp.src('size-control/polymer.json')
      .pipe(gulp.dest('build'));
  });

  gulp.task(`size-control:${shell}:polymer-build`, [
    'size-control:copy-sources',
    `size-control:${shell}:copy-sources`,
    `size-control:${shell}:polymer-config`,
  ], () => {
    return new Promise((resolve, reject) => {
      exec(
        'polymer build',
        {cwd: path.join(__dirname, 'build')},
        (error, stdout, stderr) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
    });
  });

  gulp.task(`size-control:${shell}`, [`size-control:${shell}:polymer-build`], () => {
    return gulp.src(
      [
        'build/build/es5-bundled/size-control/app-shell.html',
        'build/build/es5-bundled/size-control/vaadin-router-bundle.html',
      ])
      .pipe(size({
        title: shell,
        showFiles: true,
        showTotal: false
      }));
  });

  sizeControlTasks.push(`size-control:${shell}`);
}

gulp.task('size-control:clean', (done) => {
  return del('build', done);
});

gulp.task('size-control:copy-sources', [
  'size-control:copy-sources:bower',
  'size-control:copy-sources:vaadin-router',
  'size-control:copy-sources:vaadin-router-lib'
]);

gulp.task('size-control:copy-sources:bower', ['size-control:clean'], () => {
  return gulp.src(['bower_components/**/*'])
    .pipe(gulp.dest('build/bower_components'));
});

gulp.task('size-control:copy-sources:vaadin-router', ['size-control:clean'], () => {
  return gulp.src(['vaadin-*.html'])
    .pipe(gulp.dest('build/bower_components/vaadin-router'));
});

gulp.task('size-control:copy-sources:vaadin-router-lib', ['size-control:clean'], () => {
  return gulp.src(['lib/**/*'])
    .pipe(gulp.dest('build/bower_components/vaadin-router/lib'));
});
