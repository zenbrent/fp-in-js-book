var gulp = require('gulp');
var mocha = require('gulp-mocha');
var plumber = require('gulp-plumber');
var watch = require('gulp-watch');

var testPaths = 'tests/*.*';
var testWatchPaths = ['tests/**/*.*', 'src/**/*.*'];

// var reporters = ['html-cov', 'spec', 'nyan', 'dot', 'landing', 'tap', 'list', 'progress', 'json-stream', 'min', 'doc'];
function runTest(reporter = "spec")  {
    return gulp.src(testPaths, {read: false})
    .pipe(plumber())
    .pipe(mocha({reporter}));
}

gulp.task('test', () => runTest());
gulp.task('watch', () => watch(testWatchPaths, {verbose: true, read: false}, () => runTest("min")));
gulp.task('default', ['test', 'watch']);
