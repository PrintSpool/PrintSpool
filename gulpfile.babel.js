import chalk from 'chalk'
import rimraf from 'rimraf'
import path from 'path'
import gulp from 'gulp'
import gulpWatch from 'gulp-watch'
import babel from 'gulp-babel'
import through from 'through2'
import plumber from 'gulp-plumber'
import gutil from 'gulp-util'

import packageJSON from './package.json'
import babelConfig from './.babelrc'

const { packages } = packageJSON.workspaces

const compilationLogger = () => (
  through.obj((file, enc, callback) => {
    gutil.log(`Compiling '${chalk.cyan(file.relative)}'...`)
    callback(null, file)
  })
)

const errorsLogger = () => (
  plumber({
    errorHandler: (err) => {
      gutil.log(err.stack)
    },
  })
)

const clean = (done) => {
  rimraf(path.join(__dirname, 'packages/*/dist'), done)
}

const srcFiles = `packages/@(${packages.join('|').replace(/packages\//g, '')})/src/**/*.js`

const rename = fn => (
  through.obj((file, enc, callback) => {
    // eslint-disable-next-line no-param-reassign
    file.path = fn(file)
    callback(null, file)
  })
)

const buildProcess = gulpInput => (
  gulpInput
    .pipe(errorsLogger())
    // .pipe(compilationLogger())
    .pipe(babel(babelConfig))
    .pipe(gulp.dest((file) => {
      const dir = path.join('packages', file.relative.replace(/\/src\/.*/, '/dist/'))
      // eslint-disable-next-line no-param-reassign
      file.path = file.relative.replace(/.*\/src\//, 'dist/')
      return dir
    }))
)

const build = () => (
  // gutil.log(`Building '${chalk.cyan(pkg.name())}'`)
  buildProcess(
    gulp.src(srcFiles, { base: 'packages' }),
  )
)

const watch = () => {
  const watcher = gulp.watch(srcFiles, { delay: 50 })
  watcher.on('change', (filePath) => {
    gutil.log(`Compiling '${chalk.cyan(filePath)}'...`)
    buildProcess(
      gulp.src(filePath, { base: 'packages' }),
    )
  })
}

const everyPackage = task => (
  packages.map(pkgLocation => done => task(pkgLocation, done))
)

gulp.task(
  'clean',
  clean,
)
gulp.task(
  'build',
  gulp.series('clean', build),
)
gulp.task(
  'watch',
  gulp.series(
    'build',
    watch,
  ),
)
