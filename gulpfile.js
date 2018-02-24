var gulp = require('gulp');
var sass = require('gulp-sass');

gulp.task('sass', function () {
    gulp.src('app/sass/app.sass')
        .pipe(sass())
        .pipe(gulp.dest('app/assets/css'));
});
