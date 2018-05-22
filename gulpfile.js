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

  // TODO a stub to bypass
  // https://github.com/vaadin/vaadin-router/issues/53
  // https://github.com/vaadin/vaadin-router/issues/54
  // local developer demos (yarn start:watch) and demos in docs directory have different
  // root urls, hence different resolutions for files to load.
  // We cannot use <base href=''> and make both demos to work at the same time.
  await fs.move(
    path.join(__dirname, 'docs', 'vaadin-router', 'demo', 'demo-elements'),
    path.join(__dirname, 'docs', 'demo-elements'));
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
