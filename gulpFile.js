'use strict';

var gulp = require('gulp');
var csslint = require('gulp-csslint');
var jshint = require('gulp-jshint');
var livereload = require('gulp-livereload');
var connect = require('gulp-connect');
var useref = require('gulp-useref');
var filter = require('gulp-filter');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');
var imagemin = require('gulp-imagemin');
var pngcrush = require('imagemin-pngcrush');
var prefix = require('gulp-autoprefixer');

var config = {
    dev : 'dev',
    build : 'public_html',
    port : 9000
};

gulp.task('jshint', function() {
  return gulp.src(['gulpFile.js', 'dev/assets/scripts/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('csslint', function() {
  return gulp.src(['dev/assets/styles/*.css'])
    .pipe(prefix('last 3 version', '> 1%', 
        { 
            cascade: true 
        }
    ))
    .pipe(csslint('.csslintrc'))
    .pipe(csslint.reporter());
});

gulp.task('connect-dev', function() {
  connect.server({
    root: config.dev,
    port: config.port,
    livereload: true
  });
});

gulp.task('connect-prod', function() {
  connect.server({
    root: config.build,
    port: config.port
  });
});

gulp.task('reload', function () {
  return gulp.src(['dev/**/*.html', '!dev/assets/**'])
    .pipe(connect.reload());
});

gulp.task('watch', function () {
   gulp.watch([
        config.dev+'/assets/styles/*.css',
       ], ['csslint', 'reload']);
    
    gulp.watch([
        'gulpFile.js',
        config.dev+'/assets/scripts/**/*.js'
    ], ['jshint', 'reload']);

    gulp.watch([
        config.dev+'/*.html',
        config.dev+'/templates/**/*.html',
        config.dev+'/images/**/*'
    ], ['reload']);
});

gulp.task('html-parser', function () {
    var jsFilter = filter('**/*.js');
    var cssFilter = filter('**/*.css');

    return gulp.src([config.dev+'/**/*.html','!'+config.dev+'/assets/lib/**','!'+config.dev+'/templates/**' ])
        .pipe(useref.assets())
        .pipe(jsFilter)
        .pipe(uglify())
        .pipe(jsFilter.restore())
        .pipe(cssFilter)
        .pipe(prefix('last 3 version', '> 1%', 
            { 
                cascade: true 
            }
        ))
        .pipe(minifyCss())
        .pipe(cssFilter.restore())
        .pipe(useref.restore())
        .pipe(useref())
        .pipe(gulp.dest(config.build));
});

gulp.task('template-parser', function () {
    console.log('Building template files.. This might take a few minutes..');
    var jsFilter = filter('**/*.js');
    var cssFilter = filter('**/*.css');

    return gulp.src([config.dev+'/**/*.html','!'+config.dev+'/assets/lib/**' ])
        .pipe(useref.assets())
        .pipe(jsFilter)
        .pipe(uglify())
        .pipe(jsFilter.restore())
        .pipe(cssFilter)
        .pipe(prefix('last 3 version', '> 1%', 
            { 
                cascade: true 
            }
        ))
        .pipe(minifyCss())
        .pipe(cssFilter.restore())
        .pipe(useref.restore())
        .pipe(useref())
        .pipe(gulp.dest(config.build));
});

gulp.task('imagemin', function () {
    return gulp.src(config.dev+'/assets/images/**')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngcrush()]
        }))
        .pipe(gulp.dest(config.build+'/images'));
});

gulp.task('fonts', function () {
    return gulp.src(config.dev+'/assets/fonts/**')
                .pipe(gulp.dest(config.build+'/fonts'));
});

gulp.task('default', ['connect-dev', 'watch']);
gulp.task('build-templates', ['imagemin','fonts', 'template-parser']);
gulp.task('build', ['imagemin','fonts','html-parser']);
gulp.task('prod', ['connect-prod']);
