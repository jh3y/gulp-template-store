[![NPM](https://nodei.co/npm/gulp-template-store.png?downloads=true)](https://nodei.co/npm/gulp-template-store/)

[![Build Status](https://travis-ci.org/jh3y/gulp-template-store.svg)](https://travis-ci.org/jh3y/gulp-template-store)
#gulp-template-store
A gulp plugin for storing all of your templates in a single cache file.

```javascript
this.tmpl = {
  "test/templates/a": function(obj) {
    obj || (obj = {});
    var __t, __p = '', __e = _.escape;
    with (obj) {
      __p += '<div>' +
      __e( a ) +
      '</div>';
    }
    return __p
  }
};
```
```javascript
this.tmpl = {
  "templates/superDiv": function(){ return document.createElement('div'); }
}
```

##Install
Install using [npm](https://npmjs.org/package/gulp-template-store)

```
npm install gulp-template-store
```
##Example use

```javascript
var gulp = require('gulp'),
  tmplStore = require('gulp-template-store')
  sources = {
    templates: 'src/html/templates/**/*.html'
  },
  destinations = {
    tmpl: './tmp/'
  };
gulp.task('templates:compile', function() {
  return gulp.src(sources.templates)
    .pipe(tmplStore({
      name: 'templates.js',
      variable: 'this.templateCache',
      base: 'src/html/',
      bare: false
      options: {
        interpolate: /{{([\s\S]+?)}}/g
      }
    }))
    .pipe(gulp.dest(destinations.tmp));
})
```

The featured example will generate a single file named `templates.js` containing all template files as keyed lodash template functions contained within an object named `this.templateCache`. All keys under the file will be based to `src/html`. In addition, the templates will also evaluate Handlebars style interpolation(`{{}}`) as that has been passed in as an option.

A possible output from say the files `src/html/templates/a.html` and `src/html/templates/b.html` would be;

```javascript
this.templateCache = {
  "templates/a": [function Function],
  "templates/b": [function Function]
}
```

##Options
* `name: string` - defines the filename for outputted template file.
* `variable: string` - defines the variable that shall be used to define the templates object. By default, this is `this.tmpl`.
* `base: string` - defines the base directory to generate key names from. By default, this is the root of the repo where your gulpfile is located.
* `bare: bool` - __use with caution__ - defines whether to use lodash templating or to simply create an object store for mapping file contents.

  For example,
  ```javascript
    this.tmpl = {
      "templates/superDiv": function() { return document.createElement('div'); }
      "templates/log"   : function(msg) { console.log(msg); }
    }
  ```
* `options: object` - defines an object containing options that will be passed to the lodash template compiler. Supported options are `interpolate`, `imports` and `variable`.

##Contributing
Contributions are welcome. Feel free to submit a PR or open an issue if there's something you think is missing.

##License
MIT

@jh3y 2015
