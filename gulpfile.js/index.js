const requireDir = require('require-dir');
const gulp = require('gulp');

requireDir('./tasks', {
  recurse: true,
});

gulp.task('gen-static', gulp.parallel(['favicon', 'css']));
gulp.task('lint', gulp.parallel(['lint:js', 'lint:pug']));

gulp.task('default', gulp.parallel('gen-static'));
