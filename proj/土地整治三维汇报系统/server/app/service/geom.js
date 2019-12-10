'use strict';

const Service = require('egg').Service;
const turf = require('turf');

class GeomService extends Service {
  /**
   * 获取当前区域详细信息
   * @param {Number} gid - 对应表字段gid
   * @param {String} table - 对应表名
   */
  async getCurrentAreaInfo (gid , table, DB) {
    const sequelize = this.app.Sequelize;
    const sql = `select * from ${table} where gid = ${gid};`;
    return await this.ctx[DB].query(sql, {
      type: sequelize.QueryTypes.SELECT,
    });
  }

  /**
   * 修改规划图斑状态
   * @param {Number} gid
   * @param {String} status - 状态 1，2，3，4
   */
  async setStatus (gid, status, DB) {
    const sequelize = this.app.Sequelize;
    const sql = `update plan set status = ${status} where gid = ${gid}`;
    return await this.ctx[DB].query(sql, {
      type: sequelize.QueryTypes.SELECT
    });
  }

  /**
   * 修改乡级权重状态
   * @param {Number} gid
   * @param {String} status - 状态 1，2，3，4
   */
  async setStatusForCountry (gid, status, DB) {
    const sequelize = this.app.Sequelize;
    const sql = `update country set status = ${status} where gid = ${gid}`;
    return await this.ctx[DB].query(sql, {
      type: sequelize.QueryTypes.SELECT
    });
  }

  /**
   * 更新乡级权重状态
   * @param {String} DB 
   */
  async updateStatusForCountry (DB) {
    const sequelize = this.app.Sequelize;
    const url = `select gid from country;`;
    const countryList = await this.ctx[DB].query(url, {
      type: sequelize.QueryTypes.SELECT
    });
    for (let i = 0; i < countryList.length; i++) {
      const gid = countryList[i].gid;
      let result = await this.service.plan.getPlansIn(gid, DB);
      const {total, sumMap} = this.ctx.helper.calculateStatusWeght(this.config.statusWeight, result);

      let percentage=[...sumMap].map(s=>{
        let [k,v]=s;
        let weight=this.config.statusWeight.get(k);
        return v*weight*100/total
      }).reduce((a,b)=>a+b);
      percentage=percentage===0?0:percentage.toFixed(2)*1;

      if (isNaN(percentage)) {
        await this.service.geom.setStatusForCountry(gid, 1, DB);
      } else {
        if (percentage <= 30) {
          await this.service.geom.setStatusForCountry(gid, 1, DB);
        } else if (percentage >30 || percentage <= 60) {
          await this.service.geom.setStatusForCountry(gid, 1, DB);
        } else if (percentage >60 || percentage <= 90) {
          await this.service.geom.setStatusForCountry(gid, 1, DB);
        } else if (percentage >90) {
          await this.service.geom.setStatusForCountry(gid, 1, DB);
        }
      }
    }
  }

  async getAllCountryStatusWeight (DB) {
    const sequelize = this.app.Sequelize;
    const url = `select gid, ST_AsGeoJSON(geom) as geom from country;`;
    const countryList = await this.ctx[DB].query(url, {
      type: sequelize.QueryTypes.SELECT
    });
    let resultList = [];
    for (let i = 0; i < countryList.length; i++) {
      const {gid, geom} = countryList[i];
      let result = await this.service.plan.getPlansIn(gid, DB);
      const {total, sumMap} = this.ctx.helper.calculateStatusWeght(this.config.statusWeight, result);
      const obj = {};
      for (const [k,v] of sumMap) {
        obj[k]= isNaN((v*100/total).toFixed(2))? 0 : (v*100/total).toFixed(2)*1;
      }

      resultList.push({
        data: obj,
        geom: turf.center(JSON.parse(geom))
      });
    }

    return resultList;
  }

  async getLayer (x, y, DB){
    const sequelize = this.app.Sequelize;
    const plan = `SELECT * FROM plan WHERE st_contains (geom,ST_GeomFromText ( 'POINT(${x} ${y})', 4547 ));`;
    const spot = `SELECT * FROM spot WHERE st_contains (geom,ST_GeomFromText ( 'POINT(${x} ${y})', 4547 ));`;
    const village = `SELECT * FROM village WHERE st_contains (geom,ST_GeomFromText ( 'POINT(${x} ${y})', 4547 ));`;
    const country = `SELECT * FROM country WHERE st_contains (geom,ST_GeomFromText ( 'POINT(${x} ${y})', 4547 ));`;
    const p =  await this.ctx[DB].query(plan, {
      type: sequelize.QueryTypes.SELECT
    });
    if (p.length){
      return `plan.${p[0].gid}`;
    }
    const s =  await this.ctx[DB].query(spot, {
      type: sequelize.QueryTypes.SELECT
    });
    if (s.length){
      return `spot.${s[0].gid}`;
    }
    const v = await this.ctx[DB].query(village, {
      type: sequelize.QueryTypes.SELECT
    });
    if (v.length){
      return `village.${v[0].gid}`;
    }
    const c = await this.ctx[DB].query(country, {
      type: sequelize.QueryTypes.SELECT
    });
    if (c.length){
      return `country.${c[0].gid}`;
    }
  }
 }

module.exports = GeomService;
