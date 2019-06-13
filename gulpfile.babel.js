import { spawn } from 'child_process'
import chalk from 'chalk'
import rimraf from 'rimraf'
import path from 'path'
import gulp from 'gulp'
import sourcemaps from 'gulp-sourcemaps'
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

const babelClean = (done) => {
  rimraf(path.join(__dirname, 'packages/!(tegh-web-ui)/dist'), done)
}

const srcJSDir = `packages/@(${packages.join('|').replace(/packages\//g, '')})/src/**/`
const srcFiles = [
  `${srcJSDir}*.js`,
]

const buildProcess = gulpInput => (
  gulpInput
    .pipe(errorsLogger())
    .pipe(sourcemaps.init())
    // .pipe(compilationLogger())
    .pipe(babel(babelConfig))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest((file) => {
      const dir = path.join('packages', file.relative.replace(/\/src\/.*/, '/dist/'))
      // eslint-disable-next-line no-param-reassign
      file.path = file.relative.replace(/.*\/src\//, 'dist/')
      return dir
    }))
)

const buildBabel = () => (
  // gutil.log(`Building '${chalk.cyan(pkg.name())}'`)
  buildProcess(
    gulp.src(srcFiles, { base: 'packages' }),
  )
)

const watchBabel = () => {
  const watcher = gulp.watch(srcFiles, { delay: 50 })
  watcher.on('change', (filePath) => {
    gutil.log(`Compiling '${chalk.cyan(filePath)}'...`)
    buildProcess(
      gulp.src(filePath, { base: 'packages' }),
    )
  })
}

const run = (pkg, taskName) => () => {
  const proc = spawn(
    'yarn',
    [taskName],
    {
      cwd: path.resolve(__dirname, `packages/${pkg}`),
      env: Object.create(process.env),
    },
  )
  proc.stdout.on('data', (data) => {
    // eslint-disable-next-line no-console
    console.log(`${pkg}: ${data}`)
  })

  proc.stderr.on('data', (data) => {
    // eslint-disable-next-line no-console
    console.error(`${pkg}: ${data}`)
  })

  proc.on('close', (code) => {
    process.exit(code)
  })
}

gulp.task('babel:clean', babelClean)
gulp.task('babel:build', gulp.series(
  'babel:clean',
  buildBabel,
))
gulp.task('babel:watch', gulp.series(
  'babel:build',
  watchBabel,
))

gulp.task(
  'start',
  gulp.series(
    'babel:build',
    gulp.parallel(
      watchBabel,
      run('tegh-host-posix', 'dev'),
      run('tegh-web-ui', 'watch'),
      run('tegh-web-ui', 'serve'),
    ),
  ),
)
