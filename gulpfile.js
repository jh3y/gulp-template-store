var gulp = require('gulp'),
  coffee = require('gulp-coffee'),
  sources = {
    coffee: 'src/coffee/**/*.coffee',
    templates: 'test/templates/**/*.html'
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
  return gulp.src(sources.templates, {base: 'test/'})
    .pipe(store({
      base: 'test/'
      // options: {
      //   interpolate: /{{([\s\S]+?)}}/g
      // }
    }))
    .pipe(gulp.dest('tmp/'));
});

gulp.task('build', ['coffee:compile']);
gulp.task('default', ['build', 'coffee:watch']);
