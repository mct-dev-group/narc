/**
 * 配置文件
 * @description 写法： config.xxx = {}
 */
var config = {};

// 图层控制
config.services = {
  wms: {
    url: 'http://192.168.0.250:8888/geoserver/qibin/wms',
    version: '1.1.1',
    format: 'image/png',
    srs: 'EPSG:4547',
    layers: [
      {
        title: '行政乡',
        value: 'qibin:country'
      },
      {
        title: '行政村',
        value: 'qibin:village'
      },
      {
        title: '潜力斑点',
        value: 'qibin:spot'
      },
      {
        title: '规划斑点',
        value: 'qibin:plan'
      }
    ]
  },
  wfs: {
    url: 'http://192.168.0.250:8888/geoserver/qibin/wfs',
    version: '1.0.0',
    typenames: 'plan,spot,village,country',
    serverType: 'geoserver'
  }
}
//上传
config.server='http://localhost:7001/';

config.indePbUrl='http://192.168.0.250:9006/pb/';
config.terrainPbUrl='http://192.168.0.250:9006/terrain/';

//图斑状态
config.spotStatus=new Map([
  [1,'勘测定界'],
  [2,'设计提交'],
  [3,'立项审核'],
  [4,'评审验收'],
  [5,'变更确认'],
  [6,'质量评定'],
  [7,'指标确定'],  
]);
//图斑状态变更
config.spotStatusChange=new Map([
  ['F1to2','规划成果'],
  ['F2to3','设计批复'],
  ['F3to4','施工成果'],
  ['F4to5','评审确认表'],
  ['F5to6','变更确认表'],
  ['F6to7','待定'],
]);
//图斑转态与可用状态变更对应关系
config.spotStatusMapping=new Map([
  [1,['F1to2']],
  [2,['F1to2','F2to3']],
  [3,['F2to3','F3to4']],
  [4,['F3to4','F4to5']],
  [5,['F4to5','F5to6']],
  [6,['F5to6','F6to7']],
]);