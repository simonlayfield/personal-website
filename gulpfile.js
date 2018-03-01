const gulp = require('gulp');
const postcss = require('gulp-postcss');
const cssnext = require('postcss-cssnext');
const concat = require('gulp-concat');
const cssnano = require('cssnano');

gulp.task('css', () => {
	gulp.src('src/css/**/*.css')
	.pipe(concat('main.css'))
	.pipe(postcss([
		cssnext(),
		cssnano()
	]))
	.pipe(gulp.dest('public/css/'));
});

gulp.task('watch', () => {
	gulp.watch('src/css/**/*.css', ['css']);
});

gulp.task('default', ['watch']);
