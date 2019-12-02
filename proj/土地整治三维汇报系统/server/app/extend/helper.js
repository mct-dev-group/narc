'use strict';
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const server_path_arr = __dirname.split(path.sep);
server_path_arr.pop();
server_path_arr.pop();
const ServerRootPath = path.join(...server_path_arr);
const cmd7z = path.join(ServerRootPath, 'bin/7-Zip/7z.exe');
module.exports = {
  getPage(pageNum, pageSize) {
    pageNum = Number(pageNum);
    pageSize = Number(pageSize);

    return {
      offset: (pageNum - 1) * pageSize,
      limit: pageSize,
    };
  },
  getSuccess(data = null, msg = '操作成功！') {
    return {
      code: 1,
      data,
      msg,
    };
  },
  getFailed(data = null, msg = '操作失败！') {
    return {
      code: 0,
      data,
      msg,
    };
  },
  /**
   * @param {String} filePath file path for unzip(.zip)
   * @param {String} unzipOutPath folder path for put unziped files
   * @return {String} folder path unziped files in
   */
  unzip(filePath, unzipOutPath) {
    const cmd = `${cmd7z} x ${filePath} ${unzipOutPath ? '-o' + unzipOutPath : ''}`;
    execSync(cmd);
    const files = fs.readdirSync(unzipOutPath);
    const isFolder = files.map(f => fs.lstatSync(f).isDirectory()).every(Boolean);
    return isFolder ? unzipOutPath + '/' + files[0] : unzipOutPath;
  },
  randomString() {
    return Math.random().toString(36).substr(7);
  },
  randomNegNumber() {
    return Number.parseInt(-1 + Math.random().toString().substr(10));
  },
  delDir,
  getServerRootPath() {
    return ServerRootPath;
  },
  getFileType(filename) {
    const arr = filename.split('.');
    return arr.pop();
  },
  getFileName(filename) {
    const arr = filename.split('.');
    arr.pop();
    return arr.join('.');
  },
};

function delDir(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file) {
      const curPath = path + '/' + file;
      if (fs.statSync(curPath).isDirectory()) {
        // recurse
        delDir(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}
