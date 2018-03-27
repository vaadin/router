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
