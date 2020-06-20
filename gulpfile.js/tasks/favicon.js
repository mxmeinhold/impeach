const color = require('color');
const gulp = require('gulp');
const recolor_svg = require('gulp-recolor-svg');
const rename = require('gulp-rename');

const csh_purple = '#b0197e';
const icon_dir = './static/icon/';

gulp.task('favicon:assets', function () {
  return gulp.src('assets/*.svg').pipe(gulp.dest(icon_dir));
});

gulp.task('favicon:white', function () {
  return gulp
    .src('assets/favicon-transparent.svg')
    .pipe(
      recolor_svg.Replace(
        [recolor_svg.ColorMatcher(color('black'))],
        [color('white')]
      )
    )
    .pipe(rename('mstile.svg'))
    .pipe(gulp.dest(icon_dir));
});

gulp.task('favicon', gulp.parallel('favicon:assets', 'favicon:white'));
