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
    const isFolder = files.map(f => fs.lstatSync(path.join(unzipOutPath, f)).isDirectory()).every(Boolean);
    return isFolder ? unzipOutPath + '/' + files[0] : unzipOutPath;
  },
  /**
   * 生成六个字母长度的随机字符串
   */
  randomString() {
    return Math.random().toString(36).substr(7);
  },
  /**
   * 生成九位随机负数
   */
  randomNegNumber() {
    return Number.parseInt(-1 + Math.random().toString().substr(10));
  },
  delDir,
  /**
   * 服务器文件夹目录
   */
  getServerRootPath() {
    return ServerRootPath;
  },
  /**
   * 
   * @param {string} filename full file name 
   */
  getFileType(filename) {
    const arr = filename.split('.');
    return arr.pop();
  },
  /**
   * 
   * @param {string} filename full file name
   */
  getFileName(filename) {
    const arr = filename.split('.');
    arr.pop();
    return arr.join('.');
  },
  /**
   * 计算权重
   */
  calculateStatusWeght (statusWeight, data) {
      const statusKeys=[...statusWeight.keys()];
      const total=data.map(d=>d.shape_area*1).reduce((a,b)=>a+b,0);
      const sumMap=new Map(
        statusKeys.map(s=>{                  
          return [s,0];
        })
      );
      data.forEach((d)=>{
        const s=d.status;
        let arr=statusKeys.slice();
        arr.sort((a,b)=>a-b);
        if(s>arr[0]){                  
          for (const [k,v] of sumMap.entries()) {
            if(k<s||k===s){                        
              sumMap.set(k,v+d.shape_area*1);
            }
          }
        }else{                  
          let v=sumMap.get(arr[0]);
          sumMap.set(arr[0],v+d.shape_area*1)
        }                
      });              
      return {total, sumMap}
  }
};

/**
 * 
 * @param {string} path 递归删除的目录路径
 */
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
