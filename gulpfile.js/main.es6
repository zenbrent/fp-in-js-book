var gulp = require('gulp');
var mocha = require('gulp-mocha');
var plumber = require('gulp-plumber');
var watch = require('gulp-watch');

var testPaths = [
    'tests/*.coffee',
    'tests/*.es6',
    'tests/*.js'
];

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

function runTest()  {
    return gulp.src(testPaths, {read: false})
    .pipe(plumber())
    .pipe(mocha({
        reporter: reporters.min
    }));
}

gulp.task('test', runTest);
gulp.task('watch', () => watch(testPaths, {verbose: true, read: false}, runTest));
gulp.task('default', ['test', 'watch']);
