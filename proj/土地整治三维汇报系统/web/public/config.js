/**
 * 配置文件
 * @description 写法： config.xxx = {}
 */
var config = {};

//上传文件最大值
config.uploadMaxSize=50*1024*1024;
//附件允许文件类型
config.fileTypeATT=['txt','doc','pdf','docx','xls','xlsx','ppt','jpg','png','gif'];
// 图层控制
const qbServices={
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
      },
      {
        title: '地类图斑',
        value: 'qibin:DLTB'
      },
      {
        title: '已整治',
        value: 'qibin:yzz'
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

config.prjs=[
  {
    name: '河南',
    hasProj: true,
    itemStyle: {
      normal: {
        areaColor: '#15486d'
      }
    }
  },
  {
    name: '鹤壁市',
    hasProj: true,
    proJList: [
      {
        title: '淇滨区',
        db: 'qibin_db',
        pbUrls:['http://192.168.0.250:9006/pb/ index.pb','http://192.168.0.250:9006/terrain/ terrain.osgb.pb'],
        indexCameraParam:'524437 3959195 9542 524462 3961135 136.673102',
        geoServices:qbServices
      }
    ],
    itemStyle: {
      normal: {
        areaColor: '#15486d'
      }
    }
  }
];

config.baseUrl='http://localhost:7001/';



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
//权重
config.statusWeight=new Map([
  [1,1/7],
  [2,1/7],
  [3,1/7],
  [4,1/7],
  [5,1/7],
  [6,1/7],
  [7,1/7],
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