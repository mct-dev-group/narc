'use strict';

const Service = require('egg').Service;

class AttachmentsService extends Service {
  // 计算空间是否包含--测试
  async culcWithin(DB) {
    const sequelize = this.app.Sequelize;
    const truncate = 'truncate table country_village_tree;';
    const seq_restart = 'alter sequence cvt_gid_seq restart with 1;';
    const insert_county = 'insert into country_village_tree ( from_table, id, parent) values (\'county\',0,0);';
    const insert_country = `insert into country_village_tree ( from_table, id, parent)
      (select  'country', gid, (select x.gid from country_village_tree x where parent=0) from country c
      where not exists (select 1 from country_village_tree ct
      where ct.id = c.gid and ct.from_table = 'country'));`;
    const insert_village = `insert into country_village_tree ( from_table, id, parent)
      (select  'village',
      ov.gid,
      (select cv.gid from country c,village v,country_village_tree cv
      where ST_Area(ST_Intersection(c.geom,v.geom)) > (ST_Area(v.geom)/2)
      and v.gid = ov.gid
      and cv.from_table = 'country'
      and cv.id = c.gid)
      from village ov
      where not exists (select 1 from country_village_tree ct
      where ct.id = ov.gid and ct.from_table = 'village'));`;
    const insert_plan = `insert into country_village_tree ( from_table, id, parent)
      (select  'plan',
      op.gid,
      (select cv.gid from village v, plan p, country_village_tree cv
      where ST_Area(ST_Intersection(v.geom,p.geom)) > (ST_Area(p.geom)/2)
      and p.gid = op.gid
      and cv.from_table = 'village'
      and cv.id = v.gid)
      from plan op
      where not exists (select 1 from country_village_tree ct
      where ct.id = op.gid and ct.from_table = 'plan'));`;
    const insert_spot = `insert into country_village_tree ( from_table, id, parent)
      (select  'spot',
      os.gid,
      (select cv.gid from village v, spot s, country_village_tree cv
      where ST_Area(ST_Intersection(v.geom,s.geom)) > (ST_Area(s.geom)/2)
      and s.gid = os.gid
      and cv.from_table = 'village'
      and cv.id = v.gid)
      from spot os
      where not exists (select 1 from country_village_tree ct
      where ct.id = os.gid and ct.from_table = 'spot'));`;

    await this.app[DB].query(truncate, {
      type: sequelize.QueryTypes.TRUNCATE,
    });
    await this.app[DB].query(seq_restart, {
      type: sequelize.QueryTypes.ALTER,
    });
    await this.app[DB].query(insert_county, {
      type: sequelize.QueryTypes.INSERT,
    });
    await this.app[DB].query(insert_country, {
      type: sequelize.QueryTypes.INSERT,
    });
    await this.app[DB].query(insert_village, {
      type: sequelize.QueryTypes.INSERT,
    });
    await this.app[DB].query(insert_plan, {
      type: sequelize.QueryTypes.INSERT,
    });
    await this.app[DB].query(insert_spot, {
      type: sequelize.QueryTypes.INSERT,
    });
    return await this.app[DB].query(`select * from country_village_tree`, {
      type: sequelize.QueryTypes.SELECT,
    });
  }

  async getTree(DB) {
    const sequelize = this.app.Sequelize;
    const query = `
    select cvt.parent, cvt.gid, cvt.id, cvt.from_table,
    case
    when cvt.from_table = 'country' then
      (select c.xzqmc as label from country c where c.gid = cvt.id and cvt.from_table = 'country')
    when cvt.from_table = 'village' then
      (select v.xzqmc as label from village v where v.gid = cvt.id and cvt.from_table = 'village')
    when cvt.from_table = 'spot' then
      (select (cast (s.objectid as text)) as label from spot s where s.gid = cvt.id and cvt.from_table = 'spot')
    when cvt.from_table = 'plan' then
      (select (cast (p.objectid as text)) as label from plan p where p.gid = cvt.id and cvt.from_table = 'plan')
    else
      '县'
    end as label
    from country_village_tree cvt where not cvt.from_table = 'attachments'`;
    return await this.app[DB].query(query, {
      type: sequelize.QueryTypes.SELECT,
    });
  }

  // 保存附件
  async postAttachment(file_name, file_type, bufs, attach_to_id, attach_type = null, DB) {
    const sequelize = this.app.Sequelize;
    let list = [];
    if (attach_type) {
      list = await this.app[DB].query(
        `select gid from attachments where attach_to_id = '${attach_to_id}' and attach_type = '${attach_type}';`,
        {
          type: sequelize.QueryTypes.SELECT,
        }
      );
    }
    if (list.length) {
      await this.app[DB].query(
        `update attachments set file_name='${file_name}', file_type='${file_type}', attach_to_id='${attach_to_id}', blob_data= (?), attach_type='${attach_type}' where attach_to_id = '${attach_to_id}' and attach_type = '${attach_type}';`,
        {
          replacements: [ bufs ],
          type: sequelize.QueryTypes.UPDATE,
        }
      );
    } else {
      await this.insertArrtach(file_name, file_type, attach_to_id, bufs, attach_type, DB);
      await this.insertNewAttachToTree(DB);
    }
    return { file_name, file_type, attach_to_id, attach_type, DB };
  }

  async insertArrtach(file_name, file_type, attach_to_id, bufs, attach_type = null, DB) {
    const sequelize = this.app.Sequelize;
    const sql = 'insert into attachments ( file_name, file_type, attach_to_id, blob_data, attach_type) values (:file_name, :file_type, :attach_to_id, :bufs, :attach_type);';
    return await this.app[DB].query(sql,
      {
        type: sequelize.QueryTypes.INSERT,
        replacements: {
          file_name,
          file_type,
          attach_to_id,
          bufs,
          attach_type,
        },
      }
    );
  }

  async insertNewAttachToTree(DB) {
    const sequelize = this.app.Sequelize;
    return await this.app[DB].query(
      `insert into country_village_tree ( from_table, id, parent)
            (select  'attachments',
            oa.gid,
            oa.attach_to_id
            from attachments oa
            where not exists (select 1 from country_village_tree ct
            where ct.parent = oa.attach_to_id and ct.id = oa.gid));`,
      {
        type: sequelize.QueryTypes.INSERT,
      }
    );
  }

  async getAttachGidById(id, DB) {
    const sequelize = this.app.Sequelize;
    return await this.app[DB].query(
      `select gid from attachments where attach_to_id = ${id};`,
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );
  }

  async updateAttachGidById(oid, nid, DB) {
    const sequelize = this.app.Sequelize;
    return await this.app[DB].query(
      `update attachments set attach_to_id=${nid} where attach_to_id = ${oid};`,
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );
  }

  async getAttachmentById(id, DB) {
    const sequelize = this.app.Sequelize;
    return await this.app[DB].query(
      `select  gid, attach_to_id, file_name, file_type, blob_data, attach_type from attachments where gid = ${id};`,
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );
  }

  async getAttachmentBySetpAndId(step, id, DB) {
    const sequelize = this.app.Sequelize;
    return await this.app[DB].query(
      `select ${step}, ${step}_filename from plan where gid = ${id};`,
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );
  }

  async delAttachmentById(id, DB) {
    const sequelize = this.app.Sequelize;
    await this.app[DB].query(
      `delete from country_village_tree where id=${id} and from_table='attachments';`,
      {
        type: sequelize.QueryTypes.DELETE,
      }
    );
    return await this.app[DB].query(
      `delete from attachments where gid=${id};`,
      {
        type: sequelize.QueryTypes.DELETE,
      }
    );
  }
  async getAttachmentListById(id, DB) {
    const sequelize = this.app.Sequelize;
    return await this.app[DB].query(
      `select gid, attach_to_id, file_name, file_type, attach_type from attachments where attach_to_id = ${id};`,
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );
  }
  async query(queryStr, DB) {
    console.log(queryStr);
    return await this.app[DB].query(
      queryStr
    );
  }

  // 状态变更
  async postStep(step, id, fileName, bufs, attr = null, DB) {
    const sequelize = this.app.Sequelize;
    try {
      const sql = `update plan set 
      ${step}= (?) 
      ${fileName ? `, ${step}_filename='${fileName}'` : ''}
      ${attr ? `, ${step}_1='${attr}'` : ''} 
      where gid = '${id}';`;
      return await await this.app[DB].query(
        sql,
        {
          replacements: [ bufs ],
          type: sequelize.QueryTypes.UPDATE,
        });
    } catch (error) {
      throw error;
    }
  }

  // 所处状态查询
  async getStatus(gid, DB) {
    const sequelize = this.app.Sequelize;
    const sql = `select status from plan where gid = ${gid}`;
    return await this.app[DB].query(sql,
      {
        type: sequelize.QueryTypes.SELECT,
        replacements: {},
      }
    );
  }

  async getF2to3(gid, DB) {
    const sequelize = this.app.Sequelize;
    const sql = `select f2to3 from plan where gid = ${gid}`;
    return await this.app[DB].query(sql,
      {
        type: sequelize.QueryTypes.SELECT,
        replacements: {},
      }
    );
  }
}

module.exports = AttachmentsService;
