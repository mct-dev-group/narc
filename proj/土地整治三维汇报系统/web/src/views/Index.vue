<template>
  <div class="index">
    <el-button class="goBack" icon="el-icon-d-arrow-left" @click.native="goback">回到主地图</el-button>
    <div id="chartMap"></div>
    <el-dialog class="chartDialog" title="项目列表" width="400px" :visible.sync="dialogTableVisible">
      <ul class="proJ">
        <router-link
          style=""
          tag="li"
          v-for="(item, index) in proJList" 
          :key="index"
          :to="{
            name: 'home',
            params: {
              db: item.db
            }
          }"
        >
          {{item.title}}
        </router-link>
      </ul>
    </el-dialog>
  </div>
</template>

<script>
import echarts from 'echarts';
import jsPY from 'js-pinyin';

const basrUrl = '/assets/map/'
function getMap (name, callback) {
  let mapUrl = basrUrl;
  if (name == 'china') {
    mapUrl +=`${name}.json`;
  } else {
    mapUrl += `province/${name}.json`;
  }
  
  let _data = echarts.getMap(name);
  if (_data) {
    if (callback) {
        callback(_data)
      }
  } else {
    $.ajax({
      type: "get",
      url: mapUrl,
      async: false,
      dataType: "json",
      success: function(data) {
        if (callback) {
          callback(data)
        }
      },
      error: function(err) {
        console.log(err);
      }
    });
  }
}

export default {
  name: 'test2',
  data () {
    return {
      myChart: null,
      myOpt: null,
      dialogTableVisible: false,
      proJList: []
    }
  },
  mounted () {
    this.registerMapData();
    this.initChart();
    this.initOpt();
    this.myChart.setOption(this.myOpt);
    this.initEvent();
  },
  methods: {
    goback () {
      this.myChart.setOption(this.myOpt, true);
    },
    // 注册地图
    registerMapData(name ='china') {
      const data = getMap(name, data => {
        echarts.registerMap(name, data);
      });
    },
    // 初始化
    initChart () {
      this.myChart = echarts.init(document.getElementById('chartMap'));
    },
    initOpt () {
      let option = {
        // backgroundColor: '#080a20',
        backgroundColor: '#080a20',
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          top: 'bottom',
          left: 'right',
          data: ['北京 Top10', '上海 Top10', '广州 Top10'],
          textStyle: {
            color: '#fff'
          },
          selectedMode: 'single'
        },
        geo: {
          map: 'china',
          label: {
            normal: {
              show: true,
              color: '#ffffff',
              fontSize: 16
            },
            emphasis: {
              show: true,
              color: '#ffffff'
            },
          },
          itemStyle: {
            normal: {
              areaColor: '#132937',
              borderColor: '#0692a4'
            },
            emphasis: {
              areaColor: '#0b1c2d'
            }
          },
          regions: [
            /** start 省 start */
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
                  db: 'qibin_db'
                }
              ],
              itemStyle: {
                normal: {
                  areaColor: '#15486d'
                }
              }
            }
            /** end 省 end */
          ]
        }
      };
      this.myOpt = option;
    },
    initEvent () {
      this.myChart.on('click', params => {
        const { name, region } = params;
        if (region && region.hasProj && region.proJList) {
          // 弹出县级项目列表
          this.proJList = region.proJList;
          this.dialogTableVisible = true;
        } else if (region && region.hasProj) {
          const py = name=='陕西' ? jsPY.getFullChars(name).toLowerCase()+'1' : jsPY.getFullChars(name).toLowerCase();
          this.registerMapData(py);
          this.myChart.setOption({geo:{map:py}});
        } else {
          this.$message({
            message: '当前地区，暂无项目！！！',
            type: 'warning'
          });
        }
        
      });
      
      window.addEventListener('resize', () => {
        this.myChart.resize();
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.index {
  height: 100%;

  .goBack {
    position: absolute;
    z-index: 6;
    top: 70px;
    margin-left: 10px;

    background: #132937;
    border: 0;
    border-radius: 0;
  }  
  #chartMap {
    height: 100vh;
  }

  .proJ {
    list-style: none;
    cursor: pointer;
    margin-left: -40px;

    li {
      background: #dedede;
      height: 35px;
      line-height: 35px;
      font-size: 20px;
      padding-left: 10px;
    }
  }

}
</style>
<style lang="scss">
.chartDialog.el-dialog__wrapper {
  .el-dialog {
    .el-dialog__header{
      background: #33586C !important;
      padding: 10px 20px 10px !important;
      .el-dialog__title {
        color: #ffffff;
      }

      .el-dialog__headerbtn{
        top: 10px !important;
      }
    }
    .el-dialog__body {
      padding: 15px 10px;
    }
  }
}

</style>