const gulp = require("gulp"),
  postcss = require("gulp-postcss"),
  simpleExtend = require("postcss-extend"),
  cssnext = require("postcss-cssnext"),
  concat = require("gulp-concat"),
  cssnano = require("cssnano");

// Compile all svelte page components to static html

gulp.task("css", (done) => {
  gulp
    .src("src/css/**/*.css")
    .pipe(concat("style.css"))
    .pipe(postcss([simpleExtend(), cssnext(), cssnano()]))
    .pipe(gulp.dest("assets/"));
  done();
});

gulp.task("default", gulp.series("css"));
