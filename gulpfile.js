const gulp = require('gulp');
const clean = require('gulp-clean');
const babel = require('gulp-babel');

gulp.task('clean', function() {
	return gulp.src('dest', {read: false})
		.pipe(clean());
});

gulp.task('compileEs6', ['clean'], function() {
	return gulp.src('src/**/*.es6')
	.pipe(babel({
		presets: ['es2015']
	}))
	.pipe(gulp.dest('dest'));
});

gulp.task('copyJs', ['clean'], function() {
	return gulp.src('src/**/*.js')
		.pipe(gulp.dest('dest'));
});

gulp.task('watch', function() {
	gulp.watch('src/**/*', ['build']);
});

gulp.task('build', ['compileEs6', 'copyJs']);
gulp.task('default', ['build', 'watch']);