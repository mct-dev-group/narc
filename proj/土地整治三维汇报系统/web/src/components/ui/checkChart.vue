<template>
  <div class="checkChart">
    <div class='progress'>
      <el-row>
        <el-col :span='4'>
          <span style="font-weight:bold">总体进度&nbsp;:</span>
        </el-col>
        <el-col :span='16'>
          <div class='progress-line'>
            <el-progress :text-inside="true" :stroke-width="26" :percentage="percentage" ></el-progress>              
          </div>
        </el-col>
        <el-col :span='4' style="text-align:right;">
          <el-popover
            placement='bottom-end'
            width="200"
            trigger="hover"
            title="计算规则"
            content="总体进度=各个阶段百分比*权重之和。"
          >
            <span slot="reference" class="popover-span">计算规则<i class="el-icon-info el-icon--right"></i></span>
          </el-popover>
        </el-col>
      </el-row>
    </div>
    <div class="chart">
      <el-table 
        :data="tableData"
        size='small'
      >
        <el-table-column
          fixed="left"
          label="说明"
          width="70"
          prop='title'
        >      
        </el-table-column>
        <el-table-column v-for="(v,i) of tableColumn" :key='i' :prop="v[0]+''" :label='v[1]'></el-table-column>            
      </el-table>
      <div id="planChart" ref="planChart" @click="handleClick"></div>
    </div>
      
  </div>
</template>

<script>
export default {
  name: 'checkChart',
  data () {
    return {
      percentage:0,
      text:'',
      planChart:null,
      statusWeight:config.statusWeight,
      spotStatus:config.spotStatus,
      
    }
  },
  props:['chartData'],
  computed:{
    tableData:function(){
      if(this.chartData.sumMap){
        let [obj1,obj2]=[{},{}];
        for (const [k,v] of this.chartData.sumMap) {          
          obj1[k]=(v*100/this.chartData.total).toFixed(2)+'%';
        }
        for (const [k,v] of this.chartData.countMap) {          
          obj2[k]=v;
        }
        obj1['title']='完成量';
        obj2['title']='图斑个数';
        return [obj1,obj2]
      }else{
        return [];
      }
      
    },
    tableColumn:function(){
      return [...this.spotStatus]
    }
  },
  watch:{
    chartData:{
      handler(){
        if(this.chartData.sumMap){
          const percentage=[...this.chartData.sumMap].map(s=>{
            let [k,v]=s;
            let weight=this.statusWeight.get(k);
            return v*weight*100/this.chartData.total
          }).reduce((a,b)=>a+b);
          this.percentage=percentage===0?0:percentage.toFixed(2)*1;
        }
      },      
      deep:true
    }
  },
  methods: {
    handleClick(){
      
    },
    draw(){
      const th=this;
      this.planChart = this.$echarts.init(this.$refs.planChart);
      const spotStatus=[...this.spotStatus];
      const sumMap=this.chartData.sumMap;
      let pieAreaSeriesData=spotStatus.map(s=>{
        let [k,v]=s;
        const value=sumMap?sumMap.get(k):0;
        return {value:value,name:v}
      });
      let barAreaSeries=spotStatus.map(s=>{
        let [k,v]=s;
        let data= new Array(spotStatus.length).fill(0);
        data[k-1]=sumMap?sumMap.get(k):0;
        return {
          name: v, 
          type: 'bar',
          stack:'1',
          data:data
        }
      });
      let pieArea={
        title:{
          text:'图斑状态统计一览',          
          left:'center',
          subtext :'按图斑面积统计'
        },
        legend:{
          left:'left',
          top:'top',
          orient:'vertical',
        },
        tooltip:{
          formatter: "{b}<br/>面积：{c}平方米<br/> 占比：{d}%"
        },
        toolbox:{
          showTitle:false,
          tooltip:{
            show: true,
            position:'left',          
          },
          feature:{
            myToolToBar: {
              show: true,
              title: '切换为柱状图',
              icon: 'path://M0 870.4h1024v65.828571H0v-65.828571z m138.971429-446.171429h138.971428v409.6H138.971429V424.228571z m204.8-336.457142h138.971428v753.371428H343.771429V87.771429z m204.8 475.428571h138.971428v270.628571H548.571429V563.2z m204.8-204.8h138.971428v475.428571h-138.971428V358.4z',
              onclick:function(){
                th.planChart.clear();
                th.planChart.setOption(barArea);
              }
            },
          }
        },
        series : [
          {
            name: '详情统计',
            type: 'pie',
            radius: '55%',
            roseType: 'area',            
            center: ['50%', '65%'],
            data:pieAreaSeriesData
          },
        ]
      };
      let barArea={
        title:{
          text:'图斑状态统计一览',          
          left:'center',
          subtext :'按图斑面积统计'
        },
        legend:{
          left:'left',
          top:'top',
          orient:'vertical',
        },
        tooltip:{
          formatter: "{b}<br/>{c}平方米<br/>"
        },
        toolbox:{
          showTitle:false,
          tooltip:{
            show: true,
            position:'left',          
          },
          feature:{
            myToolToPie: {
              show: true,
              title: '切换为饼图',
              icon: 'path://M453.042424 1014.690909c124.121212 0 238.933333-49.648485 319.612121-133.430303L453.042424 564.751515V114.812121C201.69697 114.812121 0 316.509091 0 564.751515s201.69697 449.939394 453.042424 449.939394z m62.060606-515.10303H992.969697C992.969697 235.830303 778.860606 21.721212 515.10303 21.721212v477.866667z m24.824243 62.060606l322.715151 316.509091c80.678788-80.678788 130.327273-192.387879 130.327273-316.509091H539.927273z',
              onclick: function (){
                th.planChart.clear();
                th.planChart.setOption(pieArea);
              }
            },
          }
        },
        grid:{
          show:true,          
          left :'160px',
          bottom:30
        },
        xAxis:  {
          show:true,
          type: 'category',
          axisLabel : {//坐标轴刻度标签的相关设置。
            interval:0,                      
          },
          data: [...this.spotStatus.values()]
        },
        yAxis: {
          show:true,
          type: 'value',
          minInterval: 1,
          axisLabel: {
              formatter: '{value} ㎡'
          }
        },
        series : barAreaSeries
      };
      // 使用刚指定的配置项和数据显示图表。
      this.planChart.setOption(pieArea);
      //刚进入标签页时宽度不正确，手动重置
      this.planChart.resize();
    },
    clearChart(){      
      this.planChart&&this.planChart.dispose();
      this.percentage=0;
      this.text='';
    }
  }
}
</script>

<style lang="scss" scoped>
.checkChart{
  height: 540px;

  .progress{        
    padding: 0 8px;
    margin-bottom: 10px;

    .el-col{
      height: 26px;
      line-height: 26px;
    }

    .popover-span{
      font-size:14px;
      color:#606266;
      user-select: none;
      cursor:default;
    }
  }
  #planChart {
    box-sizing: border-box;
    width: 100%;
    height:350px;  
    border: 1px solid #CCC;
    margin:10px  auto 0;
  }
}


</style>