var gulp = require('gulp');
var cp = require('child_process');
var spawn = cp.spawn;
var zopfli = require('gulp-zopfli');

gulp.task('default', function(cb) {
  var dev = spawn(
    './node_modules/node-dev/bin/node-dev',
    ['./server/server.js', '--dev'],
    {stdio: 'inherit', cwd: __dirname}
  );

  dev.on('close', cb);
});


gulp.task('compress', function() {
  gulp.src('web/*.bundled.js')
    .pipe(zopfli({blocksplittinglast: true}))
    .pipe(gulp.dest('./web'));

  return gulp.src('web/*.delphi.css')
    .pipe(zopfli())
    .pipe(gulp.dest('./web'));
});
