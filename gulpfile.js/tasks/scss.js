const gulp = require('gulp');
const sass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');

gulp.task('css:compile', () => {
  return gulp
    .src('scss/**/*.scss')
    .pipe(
      sass
        .sync({
          outputStyle: 'expanded',
        })
        .on('error', sass.logError)
    )
    .pipe(gulp.dest('./static'));
});

gulp.task('css:minify', () => {
  return gulp
    .src(['./static/*.css', '!./static/*.min.css'])
    .pipe(cleanCSS())
    .pipe(
      rename({
        suffix: '.min',
      })
    )
    .pipe(gulp.dest('./static'));
});

gulp.task('css', gulp.series('css:compile', 'css:minify'));
