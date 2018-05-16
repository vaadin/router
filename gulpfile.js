'use strict';

var gulp = require('gulp');
var eslint = require('gulp-eslint');
var htmlExtract = require('gulp-html-extract');
var stylelint = require('gulp-stylelint');
const path = require('path');
const {exec} = require('child_process');
const fs = require('fs-extra');

gulp.task('lint', ['lint:js', 'lint:html', 'lint:css']);

gulp.task('lint:js', function() {
  return gulp.src([
    '*.js',
    'src/**/*.js',
    'demo/**/*.js',
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

// build the docs (including demos)
gulp.task('build:clean', () => {
  return fs.remove(path.join(__dirname, 'build'));
});

gulp.task('build:copy-sources', [
  'build:copy-sources:bower',
  'build:copy-sources:vaadin-router'
]);

gulp.task('build:copy-sources:bower', ['build:clean'], () => {
  return gulp.src(['bower_components/**/*'])
    .pipe(gulp.dest('build/bower_components'));
});

gulp.task('build:copy-sources:vaadin-router', ['build:clean'], () => {
  return gulp.src([
    'dist/umd/vaadin-router.js',
    'dist/umd/click-navigation-trigger.js',
  ])
    .pipe(gulp.dest('build/bower_components/vaadin-router/dist/umd'));
});

gulp.task('docs', ['docs:clean', 'build:copy-sources'], async() => {
  // docs
  await Promise.all([
    fs.copy(
      path.join(__dirname, 'index.html'),
      path.join(__dirname, 'build', 'bower_components', 'vaadin-router', 'index.html')),
    fs.copy(
      path.join(__dirname, 'analysis.json'),
      path.join(__dirname, 'build', 'bower_components', 'vaadin-router', 'analysis.json')),
    fs.copy(
      path.join(__dirname, 'polymer.json'),
      path.join(__dirname, 'build', 'polymer.json'))
  ]);

  await polymerBuild();

  await fs.copy(
    path.join(__dirname, 'build', 'build', 'es5-bundled', 'bower_components'),
    path.join(__dirname, 'docs'));

  // demo
  await Promise.all([
    fs.copy(
      path.join(__dirname, 'demo'),
      path.join(__dirname, 'build', 'bower_components', 'vaadin-router', 'demo')),
    fs.copy(
      path.join(__dirname, 'demo', 'polymer.json'),
      path.join(__dirname, 'build', 'polymer.json'))
  ]);

  await polymerBuild();

  await fs.copy(
    path.join(__dirname, 'build', 'build', 'es5-bundled', 'bower_components', 'vaadin-router', 'demo'),
    path.join(__dirname, 'docs', 'vaadin-router', 'demo'));

  // demo iframe
  await fs.copy(
    path.join(__dirname, 'demo', 'polymer.iframe.json'),
    path.join(__dirname, 'build', 'polymer.json'));

  await polymerBuild();

  await fs.copy(
    path.join(__dirname, 'build', 'build', 'es5-bundled', 'bower_components', 'vaadin-router', 'demo', 'iframe.html'),
    path.join(__dirname, 'docs', 'vaadin-router', 'demo', 'iframe.html'));
});

gulp.task('docs:clean', () => {
  return fs.remove(path.join(__dirname, 'docs'));
});

function polymerBuild() {
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
}