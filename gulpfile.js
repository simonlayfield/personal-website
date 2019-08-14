const gulp = require('gulp'),
      postcss = require('gulp-postcss'),
      simpleExtend = require('postcss-extend'),
      cssnext = require('postcss-cssnext'),
      concat = require('gulp-concat'),
      cssnano = require('cssnano'),
      gutil = require('gulp-util'),
    	markdownToJSON = require('gulp-markdown-to-json'),
    	marked = require('marked');

gulp.task('css', (done) => {
  gulp.src('src/css/**/*.css')
    .pipe(concat('main.css'))
    .pipe(postcss([
      simpleExtend(),
      cssnext(),
      cssnano()
    ]))
    .pipe(gulp.dest('public/css/'));
    done();
});

gulp.task('watch', () => {
  gulp.watch('src/css/**/*.css', gulp.series('css'));
});

gulp.task('blog_json', () => {
	gulp.src('public/articles/**/*.md')
    .pipe(gutil.buffer())
    .pipe(markdownToJSON(marked, 'blog.json', (data, file) => {
      delete data.body;
      data.path = file.path;
      return data;
    }, {flattenIndex: true}))
    .pipe(gulp.dest('public/articles'))
});


gulp.task('default', gulp.series('css'));
