'use strict';

const Service = require('egg').Service;

class PlansService extends Service {
  async getPlansIn(gid, DB) {
    const sequelize = this.app.Sequelize;
    let table_name = await this.app[DB].query(
      `select from_table from country_village_tree where gid = '${gid}';`,
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );
    table_name = table_name[0].from_table;
    // 县，返回全部规划图斑
    if (table_name === 'county') {
      return await this.app[DB].query(
        'select shape_area, status from plan;',
        {
          type: sequelize.QueryTypes.SELECT,
        }
      );
    }
    // 乡
    if (table_name === 'country') {
      const village_ids_array_agg = await this.app[DB].query(
        `select array_agg(gid) from country_village_tree where parent=${gid} and from_table = 'village'`,
        {
          type: sequelize.QueryTypes.SELECT,
        }
      );
      const village_ids = village_ids_array_agg[0].array_agg;
      if (!village_ids) return [];
      const sql = `select array_agg(id) from country_village_tree where parent in (${village_ids.toString()}) and from_table = 'plan';`;
      console.log(sql);
      const plan_gids_array_agg = await this.app[DB].query(
        sql,
        {
          type: sequelize.QueryTypes.SELECT,
        }
      );
      const plan_gids = plan_gids_array_agg[0].array_agg;

      return plan_gids ? await this.app[DB].query(
        `select shape_area, status from plan where gid in (${plan_gids.toString()})`,
        {
          type: sequelize.QueryTypes.SELECT,
        }
      ) : [];
    }
    // 村
    if (table_name === 'village') {
      const plan_gids_array_agg = await this.app[DB].query(
        `select array_agg(id) from country_village_tree where parent = ${gid} and from_table = 'plan';`,
        {
          type: sequelize.QueryTypes.SELECT,
        }
      );
      const plan_gids = plan_gids_array_agg[0].array_agg;
      return plan_gids ? await this.app[DB].query(
        `select shape_area, status from plan where gid in (${plan_gids.toString()})`,
        {
          type: sequelize.QueryTypes.SELECT,
        }
      ) : [];
    }
  }
}

module.exports = PlansService;
