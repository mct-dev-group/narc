'use strict';
const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const Excel = require('xlsx');
const Controller = require('egg').Controller;
const sendToWormhole = require('stream-wormhole');
const mime = require('mime');
let rb = null;

class AttachmentsController extends Controller {
  async culcWithin() {
    const { ctx, service } = this;
    const helper = ctx.helper;
    const DB = this.ctx.params.DB;
    console.log(DB);
    try {
      const result = await service.attachments.culcWithin(DB);
      rb = helper.getSuccess(result);
    } catch (error) {
      // console.log(error)
      rb = helper.getFailed(error);
    } finally {
      ctx.body = rb;
    }
  }

  async getTree() {
    const { ctx, service } = this;
    const helper = ctx.helper;
    const DB = this.ctx.params.DB;
    try {
      const result = await service.attachments.getTree(DB);
      rb = helper.getSuccess(result);
    } catch (error) {
      rb = helper.getFailed(error);
    } finally {
      ctx.body = rb;
    }
  }

  async postAttachment() {
    const { ctx, service } = this;
    const helper = ctx.helper;
    let stream = null;
    try {
      // 获取FileStream
      stream = await ctx.getFileStream();
      const bufs = [];
      const { file_name, file_type, attach_to_id, attach_type, DB } = stream.fields;
      stream.on('data', d => {
        bufs.push(d);
      });
      // await stream
      const end = new Promise((resolve, reject) => {
        stream.on('end', () =>
          resolve(async () => {
            const buf = Buffer.concat(bufs);
            const result = await service.attachments.postAttachment(
              file_name,
              file_type,
              buf,
              attach_to_id,
              attach_type,
              DB
            );
            return result;
          })
        );
        stream.on('error', reject);
      });
      const saveAndGetList = await end;
      const result = await saveAndGetList();
      rb = helper.getSuccess(result);
    } catch (error) {
      rb = helper.getFailed(error);
      // console.log(error);
      await sendToWormhole(stream);
    } finally {
      ctx.body = rb;
    }
  }

  async getAttachmentById() {
    const { ctx, service } = this;
    const helper = ctx.helper;
    const id = this.ctx.params.id;
    const DB = this.ctx.params.DB;
    console.log(id, DB);
    try {
      const result = await service.attachments.getAttachmentById(id, DB);
      const { file_type, blob_data } = result[0];
      const buffer = Buffer.from(blob_data, 'binary');
      const bufferBase64 = buffer.toString('base64');
      // result.setDataValue('mime_type', mime.lookup(file_type));
      result[0].mime_type = mime.lookup(file_type);
      result[0].blob_data = bufferBase64;
      rb = helper.getSuccess(result);
    } catch (error) {
      // console.log(error)
      rb = helper.getFailed(error);
    } finally {
      ctx.body = rb;
    }
  }

  async delAttachmentById() {
    const { ctx, service } = this;
    const helper = ctx.helper;
    const id = this.ctx.params.id;
    const DB = this.ctx.params.DB;
    try {
      const result = await service.attachments.delAttachmentById(id, DB);
      rb = helper.getSuccess(result);
    } catch (error) {
      rb = helper.getFailed(error);
    } finally {
      ctx.body = rb;
    }
  }

  async getAttachmentListById() {
    const { ctx, service } = this;
    const helper = ctx.helper;
    const id = this.ctx.params.id;
    const DB = this.ctx.params.DB;
    try {
      const result = await service.attachments.getAttachmentListById(id, DB);
      rb = helper.getSuccess(result);
    } catch (error) {
      // console.log(error)
      rb = helper.getFailed(error);
    } finally {
      ctx.body = rb;
    }
  }

  async query() {
    const { ctx, service } = this;
    const helper = ctx.helper;
    const { sql, DB } = this.ctx.query;
    console.log(sql, DB);
    try {
      const result = await service.attachments.query(sql, DB);
      rb = helper.getSuccess(result[0]);
    } catch (error) {
      // console.log(error);
      rb = helper.getFailed(error);
    } finally {
      ctx.body = rb;
    }
  }

  async getStatusByUuid() {
    const { ctx, service } = this;
    const helper = ctx.helper;
    const { uuid, DB } = this.ctx.query;
    // console.log(gid, DB);
    try {
      const result = await service.attachments.getStatusByUuid(uuid, DB);
      console.log(result[0]);
      rb = helper.getSuccess(result[0]);
    } catch (error) {
      console.log(error);
      rb = helper.getFailed(error);
    } finally {
      ctx.body = rb;
    }
  }

  async getStatusByGid() {
    const { ctx, service } = this;
    const helper = ctx.helper;
    const { gid, DB } = this.ctx.query;
    // console.log(gid, DB);
    try {
      const result = await service.attachments.getStatusByGid(gid, DB);
      console.log(result[0]);
      rb = helper.getSuccess(result[0]);
    } catch (error) {
      console.log(error);
      rb = helper.getFailed(error);
    } finally {
      ctx.body = rb;
    }
  }

  async uploadPlanshap() {
    const { ctx } = this;
    const helper = ctx.helper;
    const { shp2pg } = ctx.shp2pg;
    let stream = null;
    try {
      // 获取FileStream
      stream = await ctx.getFileStream();
      const bufs = [];
      const {
        file_name,
        file_type,
        epsg,
        db_host,
        db_port,
        DB,
        db_user_name,
        db_pass_word,
      } = stream.fields;
      stream.on('data', d => {
        bufs.push(d);
      });
      const zip_file_path = '../../temp/' + file_name + '.' + file_type;
      fsPromises.writeFile(zip_file_path, bufs).then(
        shp2pg({
          epsg,
          username: db_user_name,
          host: db_host,
          port: db_port || '',
          db: DB,
          password: db_pass_word,
          zipFilePath: zip_file_path,
        })
      );
      // rb = helper.getSuccess(result);
    } catch (error) {
      rb = helper.getFailed(error);
      // console.log(error);
      await sendToWormhole(stream);
    } finally {
      ctx.body = rb;
    }
  }

  async postF1to2() {
    const { ctx } = this;
    await this.Fmton(1, 2);
    ctx.body = rb;
  }

  async postF2to3() {
    const { ctx } = this;
    await this.Fmton(2, 3);
    ctx.body = rb;
  }

  async postF3to4() {
    const { ctx } = this;
    await this.Fmton(3, 4);
    ctx.body = rb;
  }

  async postF4to5() {
    const { ctx } = this;
    await this.Fmton(4, 5);
    ctx.body = rb;
  }

  async postF5to6() {
    const { ctx } = this;
    await this.Fmton(5, 6);
    ctx.body = rb;
  }

  async postF6to7() {
    const { ctx } = this;
    await this.Fmton(6, 7);
    ctx.body = rb;
  }

  async Fmton(m, n) {
    const { ctx, service } = this;
    const helper = ctx.helper;
    const { randomString, unzip, delDir, getServerRootPath } = ctx.helper;
    const bufs = [];
    const result = [];
    let stream = null;
    stream = await ctx.getFileStream();
    const {
      file_name,
      file_type,
      attach_type,
      attach_to_id,
      DB,
    } = stream.fields;
    stream.on('data', d => {
      bufs.push(d);
    });
    const random_folder_name = file_name + randomString();
    const server_root_path = getServerRootPath();
    const temp_path = path.join(server_root_path, 'temp');
    const zip_file_path = path.join(temp_path, file_name + '.' + file_type);
    const unzip_temp_path = path.join(temp_path, random_folder_name);
    try {
      const end = new Promise((resolve, reject) => {
        stream.on('end', () =>
          resolve(async () => {
            return Buffer.concat(bufs);
          })
        );
        stream.on('error', reject);
      });
      const getBuf = await end;
      const buf = await getBuf(); // Buffer.concat(bufs);
      await this.service.attachments.postAttachment(file_name, file_type, buf, attach_to_id, attach_type, DB);
      await fsPromises.writeFile(zip_file_path, buf);
      await fsPromises.mkdir(unzip_temp_path);
      const files_path = unzip(zip_file_path, unzip_temp_path);
      const unzip_temp_files = await fsPromises.readdir(files_path);
      const excel_file = unzip_temp_files.filter(f => f.startsWith('成果汇总表')); // 取得主Excel文件
      if (!excel_file[0]) throw '成果汇总表excel文件不存在';
      const workbook = Excel.readFile(files_path + '/' + excel_file[0]);
      const sheet1 = workbook.Sheets[ workbook.SheetNames[0] ];
      if (!sheet1['!ref']) throw '成果汇总表excel文件不存在或为空';
      for (const key in sheet1) {
        if (sheet1.hasOwnProperty(key)) {
          // B is uuid
          if (key.startsWith('B')) {
            const row = key.slice(1);
            const { v: uuid } = sheet1[key];
            const { v: snum } = sheet1[`A${row}`];
            try {
              if (row !== '1') {
                const result = await service.attachments.getStatusByUuid(uuid, DB);
                if(!result[0]) throw `规划图斑${snum}. ${uuid} 不存在。`;
                const reNumber = Number.parseInt(result[0].status);
                if (reNumber !== m && reNumber !== n) {
                  throw `${snum}. ${uuid} 无法更改当前状态，当前状态为${reNumber}。`;
                }
              }
            } catch (error) {
              console.log(error);
              result.push({ snum, uuid, error });
            }
          }
        }
      }
      if (result.length) {
        rb = helper.getFailed(result);
      } else {
        const res = await this.postChangeStatus(files_path, workbook, [ m, n ], DB);
        rb = res.code ? helper.getSuccess(res.data) : helper.getFailed(res.data);
      }
    } catch (error) {
      console.log('Fmton error', error);
      rb = helper.getFailed([{ error }]);
    } finally {
      // console.log('rb', rb);
      delDir(unzip_temp_path);
      await sendToWormhole(stream);
    }
  }

  async postChangeStatus(files_path, workbook, [ m, n ], DB) {
    const { ctx, service } = this;
    const { randomNegNumber } = ctx.helper;
    const result = [];
    const step = `f${m}to${n}`;
    const sheet1 = workbook.Sheets[ workbook.SheetNames[0] ];
    const files = fs.readdirSync(files_path);
    let attach_file_name = sheet1.C2.v;
    const is2to3 = (m === 2 && n === 3);
    let uuid, // 唯一标识
        snum; // 序号
    try {
      if (is2to3) {
        if (!files.includes(attach_file_name)) throw `未找到文件 ${attach_file_name}`;
        const splitname = attach_file_name.split('.');
        const file_type = splitname.pop();
        const file_name = splitname;
        const file_bufs = await fsPromises.readFile(files_path + '/' + attach_file_name);
        const ranId = randomNegNumber();
        await service.attachments.insertArrtach(file_name, file_type, ranId, file_bufs, null, DB);
        // console.log(1, ranId);
        const attach_gid = await service.attachments.getAttachGidById(ranId, DB);
        const { gid } = attach_gid[0];
        // console.log(2, gid);
        for (const key in sheet1) {
          if (sheet1.hasOwnProperty(key) && key.startsWith('B')) {
            const row = key.slice(1);
            if (row !== '1') {
              uuid = sheet1[ key ].v;
              snum = sheet1[`A${row}`].v;
              let attr;
              if (sheet1[ `D${row}` ]) attr = sheet1[ `D${row}` ].v;
              await service.attachments.postStep(step, uuid, null, gid, attr, DB);
              await service.attachments.setStatus(uuid, n, DB);
            }
          }
        }
        await service.attachments.updateAttachGidById(ranId, -1, DB);
      } else {
        for (const key in sheet1) {
          if (sheet1.hasOwnProperty(key)) {
            // B is uuid
            if (key.startsWith('B')) {
              const row = key.slice(1);
              if (row !== '1') {
                try {
                  if (!files.includes(attach_file_name)) throw `未找到文件 ${attach_file_name}`;
                  uuid = sheet1[ key ].v;
                  snum = sheet1[`A${row}`].v;
                  if (!uuid) throw '图斑唯一标识为空';
                  let attr;
                  if (sheet1[ `D${row}` ]) attr = sheet1[ `D${row}` ].v;
                  if (!sheet1[ `C${row}` ]) throw `未找到 ${uuid} 对应文件名`;
                  attach_file_name = sheet1[ `C${row}` ].v;
                  if (!attach_file_name) throw `未找到 ${key} 对应文件名`;
                  const file_bufs = await fsPromises.readFile(files_path + '/' + attach_file_name);
                  await service.attachments.postStep(step, uuid, attach_file_name, file_bufs, attr, DB);
                  await service.attachments.setStatus(uuid, n, DB);
                } catch (error) {
                  throw error;
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.log(3, error);
      result.push({ snum, uuid, error });
    }
    if (result.length === 0) {
      return { code: 1, data: 'ok' };
    }
    return { code: 0, data: result };
  }

  async getF1to2Attach(isAll) {
    const { pred } = isAll;
    const res = await this.getAttachFmton([ 1, 2 ], pred);
    if (pred) return res;
    this.ctx.body = rb;
  }

  async getF2to3Attach(isAll) {
    const { pred } = isAll;
    const res = await this.getAttachFmton([ 2, 3 ], pred);
    if (pred) return res;
    this.ctx.body = rb;
  }

  async getF3to4Attach(isAll) {
    const { pred } = isAll;
    const res = await this.getAttachFmton([ 3, 4 ], pred);
    if (pred) return res;
    this.ctx.body = rb;
  }

  async getF4to5Attach(isAll) {
    const { pred } = isAll;
    const res = await this.getAttachFmton([ 4, 5 ], pred);
    if (pred) return res;
    this.ctx.body = rb;
  }

  async getF5to6Attach(isAll) {
    const { pred } = isAll;
    const res = await this.getAttachFmton([ 5, 6 ], pred);
    if (pred) return res;
    this.ctx.body = rb;
  }

  async getF6to7Attach(isAll) {
    const { pred } = isAll;
    const res = await this.getAttachFmton([ 6, 7 ], pred);
    if (pred) return res;
    this.ctx.body = rb;
  }

  async getAttachFmton([ m, n ], isAll) {
    const { ctx, service } = this;
    const helper = ctx.helper;
    const { getFileName, getFileType } = helper;
    const id = this.ctx.params.id;
    const DB = this.ctx.params.DB;
    const step = `f${m}to${n}`;
    const res = {};
    try {
      if (m === 2 && n === 3) {
        const { id, DB } = this.ctx.params;
        const attachId = await this.service.attachments.getF2to3(id, DB);
        const attaId = attachId[0].f2to3;
        const attr = attachId[0].f2to3_1;
        const result = await service.attachments.getAttachmentById(attaId, DB);
        const { file_type, blob_data } = result[0];
        const buffer = Buffer.from(blob_data, 'binary');
        const bufferBase64 = buffer.toString('base64');
        result[0].mime_type = mime.lookup(file_type);
        result[0].attr = attr;
        result[0].blob_data = bufferBase64;
        result[0].step = `F${m}to${n}`;
        if (isAll) return result[0];
        rb = helper.getSuccess(result[0]);
        return;
      }
      const result = await service.attachments.getAttachmentBySetpAndId(step, id, DB);
      console.log(result);
      const file_full_name = result[0][`${step}_filename`];
      if (!file_full_name) throw '没有上传文件';
      const status = result[0].status;
      const attr = result[0][`${step}_1`];
      const file_name = getFileName(file_full_name);
      const file_type = getFileType(file_full_name);
      const blob_data = result[0][`${step}`]
      const buffer = Buffer.from(blob_data, 'binary');
      const bufferBase64 = buffer.toString('base64');
      res.file_name = file_name;
      res.file_type = file_type;
      res.step = `F${m}to${n}`;
      res.status = status;
      res.attr = attr;
      res.mime_type = mime.lookup(file_type);
      res.blob_data = bufferBase64;
      if (isAll) return res;
      console.log(res);
      rb = helper.getSuccess(res);
    } catch (error) {
      console.log(error);
      if (isAll) {
        throw error;
      } else {
        rb = helper.getFailed(error);
      }
    }
  }

  async getAllFmtonAttach() {
    const isAll = { pred: true };
    const { ctx, service } = this;
    const helper = ctx.helper;
    const id = this.ctx.params.id;
    const DB = this.ctx.params.DB;
    const status = await service.attachments.getStatusByGid(id, DB);
    try {
      let i = status[0].status;
      const result = [];
      while (i > 1) {
        const stepFn = `getF${i - 1}to${i}Attach`;
        const data = await this[stepFn](isAll);
        result.push(data);
        i -= 1;
      }
      rb = helper.getSuccess(result);
    } catch (error) {
      console.log(error);
      rb = helper.getFailed(error);
    } finally {
      console.log('rb');
      ctx.body = rb;
    }
  }
}

module.exports = AttachmentsController;
