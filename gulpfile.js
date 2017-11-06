// load the plugins
var gulp      = require('gulp');
var less      = require('gulp-less');
var minifyCSS = require('gulp-minify-css');
var nodemon = require('gulp-nodemon')
var rename    = require('gulp-rename');

// define a task called css
gulp.task('css', function() {
	// grab the less file, process the LESS, save to style.css
	return gulp.src('public/assets/css/style.less')
		.pipe(less())
		.pipe(minifyCSS())
		.pipe(rename({ suffix: '.min' }))
		.pipe(gulp.dest('public/assets/css'));
});

gulp.task('start', function () {
  nodemon({
    script: 'server.js'
  , ext: 'js html less'
  , tasks: ['css']
  , env: { 'NODE_ENV': 'development' }
  })
});