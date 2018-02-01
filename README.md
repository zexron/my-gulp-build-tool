# my-gulp-build-tool
gulp based build tool for frontend

## USAGE

### Install
- **RUN**
```bash
$ cd path/to/project/root # Path to Workspace (Eclipse) / Project (IDEA) ROOT

# for gulpfile.js
$ curl -o ./download.zip http://www.status404.cn/BuildTool/build.zip && unzip -uo ./download.zip -d ./ && rm ./download.zip && npm install

# or

# for gulpfile2.js
$ curl -o ./download.zip http://www.status404.cn/BuildTool/build2.zip && unzip -uo ./download.zip -d ./ && rm ./download.zip && npm install
```

- [package-out.json](package-out.json) is used for building your files

### Initialize a Project
```bash
$ npm run init

# input destination path
Input Project Destination(Enter 'exit' for quit): ${dest folder path}

# if your path is out of the project, a confirm will show
Path ../target is Out of Project, continue?[y|n]
```

### Start Gulp
- For IDE with gulp manager, setup in your IDE. Or run:
```bash
$ npm run gulp
```
- And enjoy your coding
- For `gulpfile2.js` users, also enjoy your sites on `http://localhost:8080/path/to/your/html`
  - You can setup your port in `gulpfile.js` at about line 79 `serverSettings.port`

## About `gulpfile.js`
This tool will:
- Compile [less](http://lesscss.org/) files
- Compile [ts](http://www.typescriptlang.org/) files
- Downgrade ES6 to ES5 (with [babel](https://babeljs.io/))
- Include template into your html with [gulp-file-include](https://github.com/coderhaoxin/gulp-file-include) with `@@include('relative.path.to.template.html', {replacement})`
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
[transform-remove-strict-mode](https://github.com/genify/babel-plugin-transform-remove-strict-mode) plugin is used to remove global "use strict", remove the plugin if needed

## About eslint
[ESLint](https://eslint.org/) and related packages have already added in `package.json` and by default `.eslintrc.js` is setup to [Standard Style](https://github.com/standard/standard)
Setup your editor to enable eslint to lint your javascript files: [ATOM](https://atom.io/packages/eslint), [IntelliJ Productions](https://www.jetbrains.com/search/?q=eslint), [Eclipse](https://github.com/angelozerr/tern.java/wiki/Tern-Linter-ESLint), [Sublime](https://packagecontrol.io/packages/ESLint)

# LICENSE
[MIT](https://github.com/zexron/my-gulp-build-tool/blob/master/LICENSE)
