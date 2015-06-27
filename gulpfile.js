var gulp = require('gulp');
var express = require('express');
var lr = require('tiny-lr')();
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var rename  = require('gulp-rename');
var minifycss = require('gulp-minify-css');
var transform = require('vinyl-transform');

// Load the configuration
var config = require('./config');
 
gulp.task('default', function () {
	
	startStaticServer();
	startLivereload();
	
	// Once processed the tasks by file let's reload the server
	gulp.watch('index.html', notifyLivereload);

});

gulp.task('sass', function () {
	
	return gulp.src('./css/style.scss')
		.pipe(sass())
		.pipe(gulp.dest('./css/'))
		.pipe(gulp.dest('css'))
		.pipe(rename({suffix: '.min'}))
		.pipe(minifycss())
		.pipe(gulp.dest('css'));

});

gulp.task('browserify', function (cb) {
	
	return browserify('./js/modules/app.js')
		.bundle()
		.pipe(source('bundle.js'))
		.pipe(gulp.dest('./dist/'));

	cb(null);
	
});

gulp.task('uglify', ['browserify'], function () {
	return gulp.src('./dist/bundle.js')
		.pipe(uglify())
		//.pipe(rename('./bundle.min.js'))
		.pipe(gulp.dest('./dist/'))
});

/**
 * Starts a static startStaticServer
 * @return {void}
 */
function startStaticServer () {
	var app = express();
	app.use(require('connect-livereload')());
	app.use(express.static(__dirname));
	app.listen(config.static.port);
}
 
function startLivereload () {
	lr.listen(config.livereload.port);
}
 
function notifyLivereload (event) {
	var files = require('path').relative(__dirname, event.path);
	lr.changed({
		'body' : {
			files: [files]
		}
	});
}