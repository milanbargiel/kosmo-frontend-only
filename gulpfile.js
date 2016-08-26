var gulp = require('gulp'),
compass = require('gulp-compass'), // compile sass files to css
autoprefixer = require('gulp-autoprefixer'), // automatically add vendor prefixes
plumber = require('gulp-plumber'); // error handling
var browserSync = require('browser-sync').create();

gulp.task('serve', ['styles'], function() {

    browserSync.init({
        server: "./"
    });

    gulp.watch("sass/**/*.scss", ['styles']);
    gulp.watch('js/*.js').on('change', browserSync.reload);
    gulp.watch("*.html").on('change', browserSync.reload);
});

var compassSettings =  {
	http_path: '/',
	css: 'stylesheets',
	sass: 'sass',
	image: 'img',
	javascript: 'js',
	require: ['compass/import-once/activate', 'breakpoint', 'susy']
};

/* Define a task (name, callback) */
gulp.task('styles', function() { 
	return gulp.src('sass/**/*.scss')
	.pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
	.pipe(compass(compassSettings))
	.pipe(autoprefixer('last 2 version'))
	.pipe(gulp.dest('stylesheets/'))
	.pipe(browserSync.stream());
});

gulp.task('default', ['serve']);
