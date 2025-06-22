const { src, dest, task, series } = require('gulp');
const less = require('gulp-less');
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');

function buildCSS() {
  return src('public/assets/css/style.less')
    .pipe(less())
    .pipe(cleanCSS())
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest('public/assets/css'));
}

function copyAnimateCSS() {
  return src('node_modules/animate.css/animate.min.css')
    .pipe(dest('public/assets/css'));
}

task('css', buildCSS);
task('copy-css', copyAnimateCSS);
task('build', series('css', 'copy-css'));
