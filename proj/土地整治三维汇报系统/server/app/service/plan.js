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
      const country_ids_array_agg = await this.app[DB].query(
        `select array_agg(gid) from country_village_tree where parent=${gid}`,
        {
          type: sequelize.QueryTypes.SELECT,
        }
      );
      const country_ids = country_ids_array_agg[0].array_agg;

      const village_gids_array_agg = await this.app[DB].query(
        `select array_agg(id) from country_village_tree where parent in (${country_ids.toString()})`,
        {
          type: sequelize.QueryTypes.SELECT,
        }
      );
      const village_gids = village_gids_array_agg[0].array_agg;

      return await this.app[DB].query(
        `select shape_area, status from plan where gid in (${village_gids.toString()})`,
        {
          type: sequelize.QueryTypes.SELECT,
        }
      );
    }
    // 村
    if (table_name === 'village') {
      const village_gids_array_agg = await this.app[DB].query(
        `select array_agg(id) from country_village_tree where parent = ${gid};`,
        {
          type: sequelize.QueryTypes.SELECT,
        }
      );
      const village_gids = village_gids_array_agg[0].array_agg;
      return await this.app[DB].query(
        `select shape_area, status from plan where gid in (${village_gids.toString()})`,
        {
          type: sequelize.QueryTypes.SELECT,
        }
      );
    }
  }
}

module.exports = PlansService;
