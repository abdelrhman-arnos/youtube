var gulp = require('gulp');
var concat = require('gulp-concat');
var sass = require('gulp-sass');

gulp.task('default', ['sass']);

gulp.task('sass', function () {
    gulp.src('app/sass/app.sass')
        .pipe(sass())
        .pipe(gulp.dest('app/assets/css'));
});
