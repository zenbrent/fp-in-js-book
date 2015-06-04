var gulp = require('gulp');
var mocha = require('gulp-mocha');
var plumber = require('gulp-plumber');
var watch = require('gulp-watch');

var testPaths = 'tests/*.*';
var testWatchPaths = ['tests/**/*.*', 'src/**/*.*'];

var reporters = {
    htmlCov: 'html-cov',
    spec: 'spec',
    nyan: 'nyan',
    dot: 'dot',
    landing: 'landing',
    tap: 'tap',
    list: 'list',
    progress: 'progress',
    jsonStream: 'json-stream',
    min: 'min',
    doc: 'doc'
};

function runTest(reporter = "spec")  {
    return gulp.src(testPaths, {read: false})
    .pipe(plumber())
    .pipe(mocha({
        reporter: reporters[reporter]
    }));
}

gulp.task('test', () => runTest());
gulp.task('watch', () => watch(testWatchPaths, {verbose: true, read: false}, () => runTest("min")));
gulp.task('default', ['test', 'watch']);
