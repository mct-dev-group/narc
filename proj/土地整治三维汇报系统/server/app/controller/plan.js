'use strict';
const Controller = require('egg').Controller;
let rb = null;
class PlansController extends Controller {
  async getPlansIn() {
    const { ctx, service } = this;
    const helper = ctx.helper;
    const gid = this.ctx.params.gid;
    const DB = this.ctx.params.DB;
    try {
      const result = await service.plan.getPlansIn(gid, DB);
      rb = helper.getSuccess(result);
    } catch (error) {
      rb = helper.getFailed(error);
    } finally {
      ctx.body = rb;
    }
  }
}

module.exports = PlansController;
