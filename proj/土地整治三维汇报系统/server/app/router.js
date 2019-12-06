'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/attachs/culcWithin/:DB', controller.attachments.culcWithin);
  router.get('/attachs/getTree/:DB', controller.attachments.getTree);
  router.post('/attachs/postAttachment', controller.attachments.postAttachment);
  router.get(
    '/attachs/getAttachmentById/:id/:DB',
    controller.attachments.getAttachmentById
  );
  router.get(
    '/attachs/getAttachmentListById/:id/:DB',
    controller.attachments.getAttachmentListById
  );
  router.delete(
    '/attachs/delAttachmentById/:id/:DB',
    controller.attachments.delAttachmentById
  );
  router.get('/attachs/query', controller.attachments.query);
  router.get('/attachs/getStatus', controller.attachments.getStatus);

  router.post('/attachs/postF1to2', controller.attachments.postF1to2);
  router.post('/attachs/postF2to3', controller.attachments.postF2to3);
  router.post('/attachs/postF3to4', controller.attachments.postF3to4);
  router.post('/attachs/postF4to5', controller.attachments.postF4to5);
  router.post('/attachs/postF5to6', controller.attachments.postF5to6);
  router.post('/attachs/postF6to7', controller.attachments.postF6to7);

  router.get('/attachs/getF1to2Attach/:id/:DB', controller.attachments.getF1to2Attach);
  router.get('/attachs/getF2to3Attach/:id/:DB', controller.attachments.getF2to3Attach);
  router.get('/attachs/getF3to4Attach/:id/:DB', controller.attachments.getF3to4Attach);
  router.get('/attachs/getF4to5Attach/:id/:DB', controller.attachments.getF4to5Attach);
  router.get('/attachs/getF5to6Attach/:id/:DB', controller.attachments.getF5to6Attach);
  router.get('/attachs/getF6to7Attach/:id/:DB', controller.attachments.getF6to7Attach);
  router.get('/attachs/getAllFmtonAttach/:id/:DB', controller.attachments.getAllFmtonAttach);

  router.get('/geom/getCurrentAreaInfo/:id/:table/:DB', controller.geom.getCurrentAreaInfo);
  router.get('/geom/setStatus/:id/:status/:DB', controller.geom.setStatus);
  router.get('/geom/getLayer/:x/:y/:DB', controller.geom.getLayer);

  router.get('/plan/getPlansIn/:gid/:DB', controller.plan.getPlansIn);
};
