// import chalk from 'chalk'
import rimraf from 'rimraf'
import path from 'path'
import gulp from 'gulp'
import gulpWatch from 'gulp-watch'
import babel from 'gulp-babel'
// import through from 'through2'
import plumber from 'gulp-plumber'
import gutil from 'gulp-util'

import packageJSON from './package.json'
import babelConfig from './.babelrc'

const { packages } = packageJSON.workspaces

// const compilationLogger = () => (
//   through.obj((file, enc, callback) => {
//     gutil.log(`Compiling '${chalk.cyan(file.relative)}'...`)
//     callback(null, file)
//   })
// )

const errorsLogger = () => (
  plumber({
    errorHandler: (err) => {
      gutil.log(err.stack)
    },
  })
)

const clean = (pkgLocation, done) => {
  // gutil.log(`Cleaning ${chalk.cyan(pkg.name())}`)

  rimraf(path.join(pkgLocation, '/dist'), done)
}

const getGlobForPackage = location => (
  path.join(location, '/src/**/*.js')
)

const build = pkgLocation => (
  // gutil.log(`Building '${chalk.cyan(pkg.name())}'`)
  gulp
    .src(getGlobForPackage(pkgLocation))
    .pipe(errorsLogger())
    // .pipe(compilationLogger())
    .pipe(babel(babelConfig))
    .pipe(gulp.dest(path.join(pkgLocation, '/dist')))
)

const watch = pkgLocation => (
  gulpWatch(
    getGlobForPackage(pkgLocation),
    { debounceDelay: 200 },
    gulp.task('build'),
  )
)

const everyPackage = task => (
  packages.map(pkgLocation => done => task(pkgLocation, done))
)

gulp.task(
  'clean',
  gulp.parallel(everyPackage(clean)),
)
gulp.task(
  'build',
  gulp.series('clean', ...everyPackage(build)),
)
gulp.task(
  'watch',
  gulp.series(
    'build',
    gulp.parallel(everyPackage(watch)),
  ),
)
