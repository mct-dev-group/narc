<template>
  <div class="tabsBox">
    <el-button size="mini" type='text' icon="el-icon-close" @click="closeTabsBox"></el-button>
    <div class="title">
      {{dataForTabs.title}}&nbsp;-&nbsp;整治详情
    </div>
    <div class="content">
      <el-tabs
        :value='activeTab'
        stretch
        :before-leave='handle'
        ref='activeTab'
        @tab-click='handleClick'
      >
        <el-tab-pane label="统计信息" name='1' v-if='dataForTabs.showType===0||dataForTabs.showType===1'>
          <checkChart v-loading='chartLoading' :chartData='chartData' ref='checkChart' />
        </el-tab-pane>
        <el-tab-pane label="附件" name='2' v-if='dataForTabs.showType!==3'>
          <attachments  ref='attachments' :gid='dataForTabs.gid' :files='files'/>
        </el-tab-pane>
        <el-tab-pane label="查看详情" name='3' v-if='dataForTabs.showType!==0'>
          <checkDetail ref='checkDetail' :details.sync='dataForTabs.details' :showType='dataForTabs.showType' :closeTabsBox='closeTabsBox'/>
        </el-tab-pane>
        <el-tab-pane label="流程文件" name='4' v-if='dataForTabs.showType===0'>          
          <processFile ref='processFile' :gid='dataForTabs.gid'/>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import  checkChart from './checkChart.vue';
import  attachments from './attachments/attachments';
import  checkDetail from './checkDetail.vue';
import  processFile from './processFile/processFile';
import {get} from '@/utils/fetch';
export default {
  name: 'tabs',
  data () {
    return {
      chartData:{
        total:0,
        sumMap:null
      },
      checkLoading:false,
      chartLoading:false,
      files:'',
      DB:this.$store.state.db
    }
  },
  props:['activeTab','dataForTabs'],
  components:{    
    checkChart,
    attachments, 
    checkDetail,    
    processFile
  },
  methods: {
    handle(aName,oName){
      switch(aName){
        //统计信息
        case '1':
          this.chartLoading=true;
        
          get('/plan/getPlansIn/'+this.dataForTabs.gid+'/'+this.DB).then(res=>{
            // console.log(res);
            if(res.code===1){
              this.chartLoading=false;

              let data=res.data;
              const statusKeys=[...config.spotStatus.keys()];
              const total=data.map(d=>d.shape_area*1).reduce((a,b)=>a+b,0);
              const sumMap=new Map(
                statusKeys.map(s=>{                  
                  return [s,0];
                })
              );
              data.forEach((d)=>{
                const s=d.status;
                let arr=statusKeys.slice();
                arr.sort((a,b)=>a-b);
                if(s>arr[0]){                  
                  for (const [k,v] of sumMap.entries()) {
                    if(k<s||k===s){                        
                      sumMap.set(k,v+d.shape_area*1);
                    }
                  }
                }else{                  
                  let v=sumMap.get(arr[0]);
                  sumMap.set(arr[0],v+d.shape_area*1)
                }                
              });              
              this.chartData.total=total;
              this.chartData.sumMap=sumMap;
              this.$refs.checkChart.draw();              
            }
          }).catch(error=>{
            console.log(error);
          });
          break;
        //附件
        case '2':          
          this.$refs.attachments.activeTab='1';
          break;
        //流程文件
        case '4':
          this.$refs.processFile.activeTab='1';
          break;
      };
      switch(oName){
        //统计信息
        case '1':
          // this.$refs.checkChart.clearChart();
          break;
        //附件
        case '2':
          this.$refs.attachments.activeTab='0';
          break;
        //流程文件
        case '4':
          this.$refs.processFile.activeTab='0';
          break;        
      }
    },
    closeTabsBox(){      
      this.$emit('update:showTabs');
      this.$emit('update:activeTab');
      this.$emit('update:lastLayer');
      this.$refs.checkChart&&this.$refs.checkChart.clearChart();
      this.$refs.attachments&&this.$refs.attachments.clear();
      this.$refs.checkDetail&&this.$refs.checkDetail.clear();
      this.$refs.processFile&&this.$refs.processFile.clear();
    },
    handleClick(tab){
      // console.log(tab);
    },
    getData(){
      this.$emit('update:files');
    }
  }
}
</script>

<style lang="scss" scoped>
.tabsBox{
  position: fixed;
  top:64px;
  left:50%;
  transform: translateX(-50%);
  width: 600px;

  background-color: #fff;
  border-radius: 8px;

  .el-button{
    position: absolute;
    top:5px;
    right: 20px;
    color:#303133;
    font-size:16px;
  }
  .el-icon-close{

  }

  .title{
    padding:10px;
    font-size: 18px;
    font-weight: bold;
  }
  .content{
    height: 400px;
  }

}
</style>