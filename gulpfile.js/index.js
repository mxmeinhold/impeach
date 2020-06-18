const requireDir = require('require-dir');
const gulp = require('gulp');

requireDir('./tasks', {recurse: true});

gulp.task('default', gulp.parallel('css'));
