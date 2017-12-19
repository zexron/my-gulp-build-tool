/**
 * Author: xuning
 * Date: 2017-10-27.
 */

// Utils
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

const gulp = require('gulp')
// HTML plugins
const fileInclude = require('gulp-file-include')
const htmlmin = require('gulp-htmlmin')
// Stylesheet plugins
const less = require('gulp-less')
const CleanCss = require('less-plugin-clean-css')
const AutoPrefix = require('less-plugin-autoprefix')
const cc = new CleanCss()
const prefix = new AutoPrefix({browsers: ['> 1%', 'last 4 versions']})
// Script plugins
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
// Common plugins
const sourcemaps = require('gulp-sourcemaps')
const plumber = require('gulp-plumber')
// Util plugins
const watch = require('gulp-watch')
const connect = require('gulp-connect')
const del = require('del')
const path = require('path')
const fs = require('fs')
const debug = {
  html: new OutputLog('HTML'),
  stylesheet: new OutputLog('STYLESHEET'),
  javascript: new OutputLog('JAVASCRIPT'),
  remove: new OutputLog('REMOVE'),
  asset: new OutputLog('ASSET'),
  system: new OutputLog('SYSTEM'),
}
// https://github.com/avevlad/gulp-connect
const serverSettings = {
  port: 8080,
  livereload: true
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
let ignoreFiles = fs.readFileSync('./.gulpignore', 'utf-8').split('\n').filter(item => item !== '').map(item => '!' + item.trim())

function getProject (vinyl) {
  let projectName
  let projectPath
  if (/^src\//.test(path.relative('./', vinyl.path))) {
    projectName = 'ROOT'
    projectPath = '.'
  } else {
    projectName = projectPath = path.relative('./', vinyl.path)
      .match(/(.+)\/src\/(.+)/)[1]
  }

  return {projectName, projectPath}
}

function resolvePath (vinyl) {
  let {projectPath} = getProject(vinyl)
  vinyl.base = `${projectPath}/src`
  return `${projectPath}/dist`
}

function initWatch () {
  const w = watch(['**/src/**', ...ignoreFiles], (vinyl) => {
    const {projectName, projectPath} = getProject(vinyl)
    switch (vinyl.event) {
      case 'add':
      case 'change': {
        let srcSteam = gulp.src(vinyl.path, {base: `${projectPath}/src`})
        let destSteam
        switch (vinyl.extname) {
          case '.html': {
            debug.html.log(path.relative(`${__dirname}/${projectPath}`, vinyl.path), 'File Include', projectName)
            destSteam = Runner.fileInclude(srcSteam)
            break
          }

          case '.less': {
            debug.stylesheet.log(path.relative(`${__dirname}/${projectPath}`, vinyl.path), 'Compile Less', projectName)
            destSteam = Runner.compileLess(srcSteam)
            break
          }

          case '.css': {
            debug.stylesheet.log(path.relative(`${__dirname}/${projectPath}`, vinyl.path), 'Compress Css', projectName)
            destSteam = Runner.compressCss(srcSteam)
            break
          }

          case '.js': {
            if (/\.min\./.test(vinyl.basename)) {
              debug.javascript.log(path.relative(`${__dirname}/${projectPath}`, vinyl.path), 'Sync JS', projectName)
              destSteam = Runner.syncJs(srcSteam)
            } else {
              debug.javascript.log(path.relative(`${__dirname}/${projectPath}`, vinyl.path), 'Compress JS', projectName)
              destSteam = Runner.compressJs(srcSteam)
            }
            break
          }

          default: {
            debug.asset.log(path.relative(`${__dirname}/${projectPath}`, vinyl.path), 'File Sync', projectName)
            destSteam = Runner.syncAsset(srcSteam)
          }
        }
        Runner.reload(destSteam)
        break
      }

      case 'unlink': {
        let destFile = `${projectPath}/dist/${path.relative(projectPath, vinyl.path).replace('src/', '')}`
        if (vinyl.extname === '.less') {
          destFile = destFile.replace(/\.less$/, '.css')
        }
        del([destFile, destFile + '.map'], {force: true})
          .then(() => {
            debug.remove.log(path.relative('./' + projectPath, vinyl.path), 'File Remove', projectName)
          })
          .catch((err) => {
            debug.remove.error(err)
          })
        break
      }

      default: {
        debug.system.log(`${CONSOLE_COLOR.RED}UNKNOWN FILE STATUS: ${vinyl.event + CONSOLE_COLOR.RESET}`, projectName)
      }
    }
  })

  w.on('unlinkDir', (dir) => {
    let {projectName, projectPath} = getProject({path: dir})
    let destDir

    destDir = `${projectPath}/dist/${path.relative(projectPath, dir).replace('src/', '')}`

    del(destDir, {force: true})
      .then(() => {
        debug.remove.log(path.relative('./' + projectPath, dir), 'Folder Remove', projectName)
      })
      .catch((err) => {
        debug.remove.error(err, projectName)
      })
  })

  return w
}

const Runner = {
  fileInclude (steam) {
    return steam
      .pipe(plumber())
      .pipe(fileInclude({
        prefix: '@@',
        basepath: '@file'
      }))
      .pipe(htmlmin({collapseWhitespace: true}))
      .pipe(gulp.dest(resolvePath))
  },
  compileLess (steam) {
    return steam
      .pipe(plumber())
      .pipe(sourcemaps.init())
      .pipe(less({
        plugins: [cc, prefix]
      }))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(resolvePath))
  },
  compressCss (steam) {
    return steam
      .pipe(plumber())
      .pipe(sourcemaps.init())
      .pipe(less({
        plugins: [cc, prefix]
      }))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(resolvePath))
  },
  syncJs (steam) {
    return steam
      .pipe(plumber())
      .pipe(gulp.dest(resolvePath))
  },
  compressJs (steam) {
    return steam
      .pipe(plumber())
      .pipe(sourcemaps.init())
      .pipe(babel())
      .pipe(uglify())
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(resolvePath))
  },
  syncAsset (steam) {
    return steam
      .pipe(plumber())
      .pipe(gulp.dest(resolvePath))
  },
  reload (steam) {
    steam.pipe(connect.reload())
  }
}

gulp.task('fileInclude', () => {
  Runner.fileInclude(gulp.src(['**/src/**/*.html', ...ignoreFiles]))
})

gulp.task('stylesheet', () => {
  Runner.compressCss(gulp.src(['**/src/**/*.less', '**/src/**/*.css', ...ignoreFiles]))
})

gulp.task('syncJs', () => {
  Runner.syncJs(gulp.src(['**/src/**/*.min.js', ...ignoreFiles]))
})

gulp.task('compressJs', () => {
  Runner.compressJs(gulp.src(['**/src/**/*.js', '!**/src/**/*.min.js', ...ignoreFiles]))
})

gulp.task('syncAsset', () => {
  Runner.syncAsset(gulp.src(['**/src/**/*', '!**/src/**/*.@(js|less|css|html)', ...ignoreFiles]))
})

gulp.task('watch', () => {
  connect.server(serverSettings)

  let w = initWatch()

  watch(['.gulpignore'], () => {
    w.close()
    ignoreFiles = fs.readFileSync('./.gulpignore', 'utf-8').split('\n').filter(item => item !== '').map(item => '!' + item.trim())
    w = initWatch()
  })
})

gulp.task('default', [
  'fileInclude',
  'stylesheet',
  'syncJs',
  'compressJs',
  'syncAsset',
  'watch'
])
