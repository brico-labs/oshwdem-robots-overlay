// load the plugins
var gulp      = require('gulp');
var less      = require('gulp-less');
var cleanCSS = require('gulp-clean-css');
var nodemon = require('gulp-nodemon')
var rename    = require('gulp-rename');

// define a task called css
gulp.task('css', function() {
	// grab the less file, process the LESS, save to style.css
	return gulp.src('public/assets/css/style.less')
		.pipe(less())
		.pipe(cleanCSS())
		.pipe(rename({ suffix: '.min' }))
		.pipe(gulp.dest('public/assets/css'));
});

gulp.task('copy-css', function() {
  return gulp.src('node_modules/animate.css/animate.min.css')
    .pipe(gulp.dest('public/assets/css'));
});

gulp.task('start', function () {
  nodemon({
    script: 'server.js'
  , ext: 'js html less'
  , tasks: ['css', 'copy-css']
  , env: { 'NODE_ENV': 'development' }
  })
});