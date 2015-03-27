var gulp = require('gulp'),
  coffee = require('gulp-coffee'),
  jade = require('gulp-jade'),
  sources = {
    coffee: 'src/coffee/**/*.coffee',
    templates: 'src/jade/templates/**/*.jade'
  },
  destinations = {
    js: './'
  };
gulp.task('coffee:compile', function(event) {
  return gulp.src(sources.coffee, {base: 'src/coffee/'})
    .pipe(coffee({
      bare: true
    }))
    .pipe(gulp.dest(destinations.js));
});
gulp.task('coffee:watch', function(event) {
  gulp.watch(sources.coffee, ['coffee:compile']);
});
gulp.task('test:store', function(event) {
  var store = require('./lib/index.js');
  return gulp.src(sources.templates, {base: 'src/jade/'})
    .pipe(jade())
    .pipe(store({
      name: 'tmpl.js',
      variable: 'this.tmpl',
      base: 'src/jade/templates/',
      amd: true
    }, {
      lodash: true
    }))
    .pipe(gulp.dest('tmp/'));
});

gulp.task('build', ['coffee:compile']);
gulp.task('default', ['build', 'coffee:watch']);
