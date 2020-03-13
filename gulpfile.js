var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify-es').default;
var uglifycss = require('gulp-uglifycss');

gulp.task('js', function(){
  return gulp.src([
          'src/libs/jquery-1-11-0.min.js', 
          'src/libs/tether.min.js', 
          'src/libs/jquery-ui.min.js',  
          'src/libs/underscore-min.js',
          'src/libs/jquery.resize.js',
          'src/libs/nouislider.min.js', 
          'src/libs/loadingDot.js',
          'src/libs/bootstrap.min.js',
          'src/libs/bootstrap-tour.min.js',
          'src/libs/jquery.onepage-scroll.min.js',
          'src/libs/moment.min.js',
          'src/libs/bootstrap-datetimepicker.min.js',
          'src/libs/angular.min.js', 
          'src/libs/angular-idle.min.js',
          'src/libs/angular-route.min.js', 
          'src/libs/angular-sanitize.min.js',
          'src/libs/ng-table.min.js', 
          'src/libs/angular-file-model.js', 
          'src/libs/angular-bootstrap-multiselect.js',
          'src/libs/angular-bootstrap3-typeahead.js',
          'src/libs/angular-autoheight.js',
          'src/libs/angular-bootstrap-toggle.min.js',
          'src/libs/angular-bootstrap-datetimepicker-directive.min.js', 
          'src/libs/angular-cache-buster.js', 
          'src/libs/bootstrap3-typeahead.js',
          'src/libs/showdown.min.js',
          'src/libs/ng-showdown.min.js',
          'src/libs/Chart.bundle.min.js', 
          'src/libs/tc-angular-chartjs.min.js', 
          'src/libs/chartjs-plugin-datalabels.min.js',
          'src/libs/Chart.PieceLabel.min.js', 
          'src/libs/d3.v4.min.js', 
          'src/libs/d3-sankey.js',
          'src/libs/topojson.v1.min.js',
          'src/libs/papaparse.min.js', 
          'src/libs/xlsx.full.min.js', 
          'src/services/pivot.js', 
          'src/services/chartRenderer.js', 
          'src/utils/global.js',
          'src/utils/urlBuilder.js',
          'src/utils/session.js',
          'src/utils/ui.js',
          'src/utils/commons.js',
          'src/utils/utils.js',
          'src/app.js', 
          'src/services/chartService.js',
          'src/controllers/**/*.js'
        ])
    .pipe(concat('build.js'))
    .pipe(rename("build.min.js"))
    .pipe(uglify({mangle:false}))
    .pipe(gulp.dest('dist'))
});
gulp.task('css', function(){
  return gulp.src([
    'src/css/vendor/*',
    'src/css/pivot.css',
    'src/css/custom.css',
  ])
  .pipe(concat('styles.css'))
  .pipe(rename("styles.min.css"))
  .pipe(uglifycss({
    "uglyComments": true
  }))
  .pipe(gulp.dest('dist'))
});

gulp.task('build', ['js','css']);
          