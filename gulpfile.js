const gulp = require('gulp');
const browserify = require('browserify');
const del = require('del');
const source = require('vinyl-source-stream');
const tsify = require('tsify');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const buffer = require('vinyl-buffer');
const paths = {
    allSrcTs: 'src/**/*.ts',
    staticFiles: ['src/*.html', 'src/*.css'],
    destDir: 'docs',
    destFiles: ['docs/*.js', 'docs/*.html', 'docs/*.css']
};

gulp.task('clean', () => del(paths.destFiles));

gulp.task('copy-html', () =>
    gulp.src(paths.staticFiles)
        .pipe(gulp.dest(paths.destDir))
);

gulp.task('build-debug', ['clean', 'copy-html'], () =>
    browserify({
        basedir: '.',
        debug: true,
        entries: ['src/main.ts'],
        cache: {},
        packageCache: {}
    })
    .plugin(tsify)
    .transform('babelify', {
        presets: ['es2015'],
        extensions: ['.ts']
    })
    .bundle()
    .pipe(source('bundle.js'))
    // .pipe(buffer())
    // .pipe(sourcemaps.init({loadMaps: true}))
    // .pipe(uglify())
    // .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(paths.destDir))
);

gulp.task('build', ['clean', 'copy-html'], () =>
    browserify({
        basedir: '.',
        debug: false,
        entries: ['src/main.ts'],
        cache: {},
        packageCache: {}
    })
    .plugin(tsify)
    .transform('babelify', {
        presets: ['es2015'],
        extensions: ['.ts']
    })
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest(paths.destDir))
);

gulp.task('watch-debug', () => {
  gulp.watch(paths.allSrcTs, ['build-debug']);
});

gulp.task('watch', () => {
  gulp.watch(paths.allSrcTs, ['build']);
});

gulp.task('main-debug', ['watch-debug', 'build-debug']);

gulp.task('main', ['watch', 'build']);

gulp.task('default', ['main']);
