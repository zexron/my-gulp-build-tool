/**
 * Author: xuning
 * Date: 2017-8-28.
 */
class OutputLog {
  constructor (namespace) {
    this.namespace = namespace
    this.color = `\u001b[3${OutputLog.color}m`

    return this
  }

  log (string, info, project = 'unknown') {
    console.log(`[${CONSOLE_COLOR.UNDERLINE + dateFormat(new Date(), 'hh:mm:ss') + CONSOLE_COLOR.RESET}] ${this.color + this.namespace +
    CONSOLE_COLOR.RESET}-${CONSOLE_COLOR.BLUE_GREEN + info + CONSOLE_COLOR.RESET}`, `  ${this.color + project + CONSOLE_COLOR.RESET}`, string)
  }

  error (string, project = 'unknown') {
    console.error(
      `[${CONSOLE_COLOR.UNDERLINE + dateFormat(new Date(), 'hh:mm:ss') + CONSOLE_COLOR.RESET}] ${this.color +
      this.namespace + CONSOLE_COLOR.RESET}`, this.color + project + CONSOLE_COLOR.RESET, string)
  }
}

OutputLog.color = 1

function dateFormat (e, t) {
  const g = {
    'M+': e.getMonth() + 1,
    'd+': e.getDate(),
    'h+': e.getHours(),
    'm+': e.getMinutes(),
    's+': e.getSeconds(),
    'q+': Math.floor((e.getMonth() + 3) / 3),
    S: e.getMilliseconds()
  }
  const yearTest = /(y+)/
  yearTest.test(t) && (t = t.replace(RegExp.$1, (e.getFullYear() + '').substr(4 - RegExp.$1.length)))
  for (let r in g) {
    new RegExp('(' + r + ')').test(t) &&
    (t = t.replace(RegExp.$1, RegExp.$1.length === 1 ? g[r] : ('00' + g[r]).substr(('' + g[r]).length)))
  }
  return t
}

const CONSOLE_COLOR = {
  RESET: '\u001b[0m',
  UNDERLINE: '\u001b[4m',

  WHITE: '\u001b[30m',
  RED: '\u001b[31m',
  GREEN: '\u001b[32m',
  YELLOW: '\u001b[33m',
  BLUE: '\u001b[34m',
  PURPLE: '\u001b[35m',
  BLUE_GREEN: '\u001b[36m',
  GRAY: '\u001b[37m',

  BG_WHITE: '\u001b[40m',
  BG_RED: '\u001b[41m',
  BG_GREEN: '\u001b[42m',
  BG_YELLOW: '\u001b[43m',
  BG_BLUE: '\u001b[44m',
  BG_PURPLE: '\u001b[45m',
  BG_BLUE_GREEN: '\u001b[46m',
  BG_GRAY: '\u001b[47m',
}

const fileInclude = require('gulp-file-include')
const htmlmin = require('gulp-htmlmin')
const gulp = require('gulp')
const less = require('gulp-less')
const CleanCss = require('less-plugin-clean-css')
const AutoPrefix = require('less-plugin-autoprefix')
const babel = require('gulp-babel')
const sourcemaps = require('gulp-sourcemaps')
const plumber = require('gulp-plumber')
const uglify = require('gulp-uglify')
const del = require('del')
const watch = require('gulp-watch')
const path = require('path')
const fs = require('fs')
const debug = {
  html: new OutputLog('HTML'),
  stylesheet: new OutputLog('STYLESHEET'),
  javascript: new OutputLog('JAVASCRIPT'),
  remove: new OutputLog('REMOVE'),
  asset: new OutputLog('ASSET'),
}
const ignoreFiles = fs.readFileSync('./.gulpignore', 'utf-8').split('\n').filter(item => item !== '').map(item => '!' + item.trim())

gulp.task('fileInclude', () => {
  return watch(['**/src/**/*.html', ...ignoreFiles], (vinyl) => {
    let projectName, projectPath
    if (/^src\//.test(path.relative('./', vinyl.path))) {
      projectName = 'ROOT'
      projectPath = '.'
    } else {
      projectName = projectPath = path.relative('./', vinyl.path)
        .match(/(.+)\/src\/(.+)/)[1]
    }

    if (vinyl.event === 'unlink') {
      let dest = `${projectPath}/dist/${path.relative(projectPath, vinyl.path)
        .replace('src/', '')}`
      del(dest, {force: true})
        .then((paths) => {
          paths.forEach(function (file) {
            debug.remove.log(path.relative('./' + projectPath, file), 'Html File', projectName)
          })
        })
        .catch((err) => {
          debug.remove.error(err, projectName)
        })
    } else {
      gulp.src([`${projectPath}/src/**/*.html`], {base: projectPath + '/src'})
        .pipe(plumber())
        .pipe(fileInclude({
          prefix: '@@',
          basepath: '@file'
        }))
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest(projectPath + '/dist'))
        .on('end', () => {
          debug.html.log(path.relative('./' + projectPath, vinyl.path), 'File Include', projectName)
        })
    }
  })
})

gulp.task('stylesheet', () => {
  let cc = new CleanCss()
  let prefix = new AutoPrefix({browsers: ['> 1%', 'last 4 versions']})
  return watch(['**/src/**/*.less', '**/src/**/*.css', ...ignoreFiles], (vinyl) => {
    let projectName, projectPath
    if (/^src\//.test(path.relative('./', vinyl.path))) {
      projectName = 'ROOT'
      projectPath = '.'
    } else {
      projectName = projectPath = path.relative('./', vinyl.path)
        .match(/(.+)\/src\/(.+)/)[1]
    }

    if (vinyl.event === 'unlink') {
      let dest = `${projectPath}/dist/${path.relative(projectPath, vinyl.path)
        .replace('src/', '')}`
      del(dest, {force: true})
        .then((paths) => {
          paths.forEach(function (file) {
            debug.remove.log(path.relative('./' + projectPath, file), 'Stylesheet File', projectName)
          })
        })
        .catch((err) => {
          debug.remove.error(err, projectName)
        })
    } else {
      gulp.src([`${projectPath}/src/**/*.less`, `${projectPath}/src/**/*.css`], {base: projectPath + '/src'})
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(less({
          plugins: [cc, prefix]
        }))
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest(`${projectPath}/dist`))
        .on('end', () => {
          let printString
          switch (vinyl.extname) {
            case '.less': {
              printString = 'Compile Less'
              break
            }
            case '.css': {
              printString = 'Compress Css'
              break
            }

            default: {
              printString = ''
            }
          }

          debug.stylesheet.log(path.relative('./' + projectPath, vinyl.path), printString, projectName)
        })
    }
  })
})

gulp.task('compressJs', () => {
  return watch(['**/src/**/*.js', ...ignoreFiles], (vinyl) => {
    let projectName, projectPath
    if (/^src\//.test(path.relative('./', vinyl.path))) {
      projectName = 'ROOT'
      projectPath = '.'
    } else {
      projectName = projectPath = path.relative('./', vinyl.path)
        .match(/(.+)\/src\/(.+)/)[1]
    }

    if (vinyl.event === 'unlink') {
      let dest = `${projectPath}/dist/${path.relative(projectPath, vinyl.path).replace('src/', '')}`
      del(dest, {force: true})
        .then((paths) => {
          paths.forEach(function (file) {
            debug.remove.log(path.relative('./' + projectPath, file), 'Javascript File', projectName)
          })
        })
        .catch((err) => {
          debug.remove.error(err, projectName)
        })
    } else {
      if (/\.min\./.test(vinyl.basename)) {
        gulp.src([`${projectPath}/src/**/*.min.js`], {base: `${projectPath}/src`})
          .pipe(plumber())
          .pipe(gulp.dest(`${projectPath}/dist`))
          .on('end', () => {
            debug.javascript.log(path.relative('./' + projectPath, vinyl.path), 'Sync JS', projectName)
          })
      } else {
        gulp.src([`${projectPath}/src/**/*.js`, `!${projectPath}/src/**/*.min.js`], {base: `${projectPath}/src`})
          .pipe(plumber())
          .pipe(sourcemaps.init())
          .pipe(babel())
          .pipe(uglify())
          .pipe(sourcemaps.write('./maps'))
          .pipe(gulp.dest(`${projectPath}/dist`))
          .on('end', () => {
            debug.javascript.log(path.relative('./' + projectPath, vinyl.path), 'Compress JS', projectName)
          })
      }
    }
  })
})

gulp.task('syncAsset', () => {
  let w = watch(['**/src/**', '!**/src/**/*.@(js|less|css|html)', ...ignoreFiles], (vinyl) => {
    let projectName, projectPath, destFile

    if (/^src\//.test(path.relative('./', vinyl.path))) {
      projectName = 'ROOT'
      projectPath = '.'
    } else {
      projectName = projectPath = path.relative('./', vinyl.path)
        .match(/(.+)\/src\/(.+)/)[1]
    }

    destFile = `${projectPath}/dist/${path.relative(projectPath, vinyl.path).replace('src/', '')}`

    switch (vinyl.event) {
      case 'add':
      case 'change': {
        gulp.src(vinyl.path, {base: `${projectPath}/src`})
          .pipe(plumber())
          .pipe(gulp.dest(`${projectPath}/dist`))
          .on('end', () => {
            debug.asset.log(path.relative('./' + projectPath, vinyl.path), 'File Sync', projectName)
          })
        break
      }

      case 'unlink': {
        del(destFile, {force: true})
          .then(() => {
            debug.remove.log(path.relative('./' + projectPath, vinyl.path), 'File Remove', projectName)
          })
          .catch((err) => {
            debug.remove.error(err)
          })
        break
      }

      default: {
        debug.asset.log(`${CONSOLE_COLOR.RED}UNKNOWN FILE STATUS: ${vinyl.event + CONSOLE_COLOR.RESET}`, projectName)
      }
    }
  })

  w.on('unlinkDir', (dir) => {
    let projectName, projectPath, destDir

    if (/^src\//.test(path.relative('./', dir))) {
      projectName = 'ROOT'
      projectPath = '.'
    } else {
      projectName = projectPath = path.relative('./', dir)
        .match(/(.+)\/src\/(.+)/)[1]
    }

    destDir = `${projectPath}/dist/${path.relative(projectPath, dir)
      .replace('src/', '')}`

    del(destDir, {force: true})
      .then(() => {
        debug.remove.log(path.relative('./' + projectPath, dir), 'Folder Remove', projectName)
      })
      .catch((err) => {
        debug.remove.error(err, projectName)
      })
  })
})

gulp.task('default', [
  'fileInclude',
  'stylesheet',
  'compressJs',
  'syncAsset',
])
