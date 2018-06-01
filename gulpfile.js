'use strict';

var gulp = require('gulp');
const path = require('path');
const {exec} = require('child_process');
const fs = require('fs-extra');

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
  return gulp.src(['dist/vaadin-router.umd.js'])
    .pipe(gulp.dest('build/bower_components/vaadin-router/dist'));
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

  // HTML imports for lazy loading demo
  await fs.copy(
    path.join(__dirname, 'bower_components', 'polymer', 'lib', 'utils', 'import-href.html'),
    path.join(__dirname, 'docs', 'polymer', 'lib', 'utils', 'import-href.html'));

  await fs.copy(
    path.join(__dirname, 'bower_components', 'polymer', 'lib', 'utils', 'boot.html'),
    path.join(__dirname, 'docs', 'polymer', 'lib', 'utils', 'boot.html'));
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
