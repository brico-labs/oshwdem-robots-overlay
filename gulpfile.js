// Load the plugins
const { src, dest, task, series, watch } = require('gulp');
const less = require('gulp-less');
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const nodemon = require('gulp-nodemon');

// Compile LESS to minified CSS
function buildCSS() {
  return src('public/assets/css/style.less')
    .pipe(less())
    .pipe(cleanCSS())
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest('public/assets/css'));
}

// Copy animate.css from node_modules
function copyAnimateCSS() {
  return src('node_modules/animate.css/animate.min.css')
    .pipe(dest('public/assets/css'));
}

// Start server with Nodemon and watch for changes
function startServer(cb) {
  let started = false;

  return nodemon({
    script: 'server.js',
    ext: 'js html less',
    tasks: ['css', 'copy-css'],
    env: { 'NODE_ENV': 'development' }
  }).on('start', function () {
    if (!started) {
      cb();
      started = true;
    }
  });
}

// Define tasks (Gulp 4/5 style)
task('css', buildCSS);
task('copy-css', copyAnimateCSS);
task('start', series('css', 'copy-css', startServer));