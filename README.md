# my-gulp-build-tool
gulp based build tool for frontend

## Easy Install
1. Download and put `package.json` under your **Workspace** (Eclipse) / **Project** (IDEA) **ROOT**
2. run
```bash
$ npm run start     # for gulpfile.js

# or

$ npm run start2    # for gulpfile2.js
```

## Init Project
```bash
$ npm run init

# input destination path
Input Project Destination(Enter 'exit' for quit): ${dest folder path}

# if your path is out of the project, a confirm will show
Path ../target is Out of Project, continue?[y|n]
```

## Start Gulp
- For IDE with gulp manager, setup in your IDE. Or run: 
```bash
$ npm run gulp
```
- And enjoy your coding
- For `gulpfile2.js` users, also enjoy your sites on `http://localhost:8080/path/to/your/html`

## About `gulpfile.js`
This tool will:
- Compile `.less` files
- Downgrade ES6 to ES5
- Include template into your html with `gulp-file-include` with `@@include('relative.path.to.template.html', {replacement})`
- Compress **.less/.css/.js** files 
- Start up a server on port **8080** with [LiveReload](http://livereload.com/)(Only in `gulpfile2.js`)

**Note:** 
- If downgrade or compress `.js` file is *not* needed, rename it to `*.min.js`, tool will only copy `*.min.js` file
- Like `.eslintignore`, you can setup ignore paths/files in `.gulpignore` **e.g.** 
```bash
## .gulpignore

**/foo/**  # ignore mathed path
./path/to/js/file.js # ignore file

# Comment is not supported, delete comments and extra blanks when use
```

## About babel
`transform-remove-strict-mode` plugin is used to remove global "use strict", remove the plugin if needed

## About eslint
`eslint` and related packages have already added in `package.json` and by default `.eslintrc.js` is setup to [Standard Style](https://github.com/standard/standard)   
Setup your editor to enable eslint to lint your javascript files: [ATOM](https://atom.io/packages/eslint), [IntelliJ Productions](https://www.jetbrains.com/search/?q=eslint), [Eclipse](https://github.com/angelozerr/tern.java/wiki/Tern-Linter-ESLint), [Sublime](https://packagecontrol.io/packages/ESLint)

# LICENSE
[MIT](https://github.com/zexron/my-gulp-build-tool/blob/master/LICENSE)
