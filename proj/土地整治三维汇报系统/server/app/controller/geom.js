'use strict';

const Controller = require('egg').Controller;

let rb = null;
class GeomController extends Controller {
  async getCurrentAreaInfo () {
    const { id, table, DB } = this.ctx.params;
    try {
      const result = await this.service.geom.getCurrentAreaInfo(id, table, DB);
      rb = this.ctx.helper.getSuccess(result);
    } catch (error) {
      rb = this.ctx.helper.getFailed();
    } finally {
      this.ctx.body = rb;
    }
  }

  async setStatus () {
    const { id, status, DB } = this.ctx.params;
    try {
      const result = await this.service.geom.setStatus(id, status, DB);
      rb = this.ctx.helper.getSuccess(result);
    } catch (error) {
      rb = this.ctx.helper.getFailed();
    } finally {
      this.ctx.body = rb;
    }
  }

  /**
   * 更新乡级权重状态
   */
  async updateStatusForCountry () {
    const { DB } = this.ctx.params;
    try {
      const result = await this.service.geom.updateStatusForCountry(DB);
      rb = this.ctx.helper.getSuccess(result);
    } catch (error) {
      rb = this.ctx.helper.getFailed();
    } finally {
      this.ctx.body = rb;
    }
  }

  /**
   * 返回乡级各个状态占比
   */
  async getAllCountryStatusWeight () {
    const { DB } = this.ctx.params;
    try {
      const result = await this.service.geom.getAllCountryStatusWeight(DB);
      rb = this.ctx.helper.getSuccess(result);
    } catch (error) {
      rb = this.ctx.helper.getFailed();
    } finally {
      this.ctx.body = rb;
    }
  }

  async getLayer () {
    const { x, y, DB } = this.ctx.params;
    try {
      const result = await this.service.geom.getLayer(x, y, DB);
      rb = this.ctx.helper.getSuccess(result);
    } catch (error) {
      rb = this.ctx.helper.getFailed();
    } finally {
      this.ctx.body = rb;
    }
  }
}

module.exports = GeomController;
