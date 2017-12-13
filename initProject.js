/**
 * Author: xuning
 * Date: 2017-8-29.
 */
/**
 * Created by xuning on 2016/12/31.
 */
const fs = require('fs')
const path = require('path')
const readline = require('readline')
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})
const pathNames = [
  {
    base: 'dist',
    children: [
      {
        base: 'assets',
        children: [{base: 'images'}, {base: 'css'}, {base: 'js'}]
      },
      {base: 'stylesheet'},
      {base: 'js'},
      {
        base: 'sites',
        children: [{base: 'include'}]
      }
    ]
  },
  {
    base: 'src',
    children: [
      {
        base: 'assets',
        children: [{base: 'images'}, {base: 'css'}, {base: 'js'}]
      },
      {
        base: 'stylesheet',
        children: [{base: 'include'}]
      },
      {base: 'js'},
      {
        base: 'sites',
        children: [{base: 'include'}]
      }
    ]
  }
]

let dirName

rl.question('Input Project Destination(Enter \'exit\' for quit): ', (answer) => {
  if (answer.toLowerCase() === 'exit' || answer.toLowerCase() === 'quit') {
    rl.close()
    process.exit(0)
  }

  let relativePath = path.relative('./', answer)

  if (/^\.{2}/.test(relativePath)) {
    rl.question(`Path \u001b[35m${relativePath}\u001b[0m is \u001b[31mOut of Project\u001b[0m, continue?[y|n] `, (answer2) => {
      if (answer2.toLowerCase() === 'y' || answer2.toLowerCase() === 'yes') {
        preMakeProjectDir(relativePath)
        dirName = answer
        pathNames.forEach(function (item) {
          makeDir(dirName, item)
        })
      }
      rl.close()
      process.exit(0)
    })
  } else {
    preMakeProjectDir(relativePath)
    dirName = answer
    pathNames.forEach(function (item) {
      makeDir(dirName, item)
    })
    rl.close()
    process.exit(0)
  }
})

function preMakeProjectDir (path) {
  let pathArr = path.split('/')
  let currPath = ''
  for (let i = 0, max = pathArr.length; i < max; i++) {
    currPath = currPath + pathArr[i] + '/'
    fs.existsSync(currPath) || fs.mkdirSync(currPath)
  }
}

function makeDir (parent, pathObj) {
  let base = parent + '/' + pathObj.base
  let exist = fs.existsSync(base)

  if (pathObj.type === 'file') {
    exist || fs.writeFileSync(base)
  } else {
    exist || fs.mkdirSync(base)
  }

  outputLog(base, exist)
  if (!pathObj['children']) return
  pathObj.children.forEach(function (item) {
    makeDir(base, item)
  })
}

function outputLog (folder, exist) {
  let prefix = 'FOLDER CREATED: '
  if (exist) prefix = 'FOLDER EXIST: '
  console.log(prefix + folder)
}
