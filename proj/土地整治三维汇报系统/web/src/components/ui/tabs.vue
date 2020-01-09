<template>
  <div class="tabsBox">
    <div class="content">
      <el-tabs
        :value='activeTab'
        stretch
        :before-leave='handle'
        ref='activeTab'        
      >        
        <el-tab-pane label="统计信息" name='1' v-if='dataForTabs.showType===0||dataForTabs.showType===1'>
          <checkChart v-loading='chartLoading' element-loading-text="加载中..." :chartData='chartData' ref='checkChart' />          
        </el-tab-pane>
        <el-tab-pane label="附件" name='2' v-if='dataForTabs.showType!==3'>
          <attachments  ref='attachments' :gid='dataForTabs.gid' :files='files'/>
        </el-tab-pane>
        <el-tab-pane label="查看详情" name='3' v-if='dataForTabs.showType!==0'>
          <checkDetail ref='checkDetail' v-loading='detailLoading' :details.sync='dataForTabs.details' :thumbnails='thumbnails' :showType='dataForTabs.showType' :lastFile='lastFile'/>
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
        sumMap:null,
        countMap:null
      },      
      chartLoading:false,
      files:'',
      detailLoading:false,
      thumbnails:null,
      lastFile:null,
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
            if(res.code===1){
              this.chartLoading=false;
              let data=res.data;              
              if(data.length>0){                
                const statusKeys=[...config.spotStatus.keys()];
                const total=data.map(d=>d.shape_area*1).reduce((a,b)=>a+b,0);
                const sumMap=new Map(
                  statusKeys.map(s=>{
                    return [s,0];
                  })
                );
                const countMap=new Map(
                  statusKeys.map(s=>{
                    return [s,0];
                  })
                );
                [...countMap.keys()].forEach(k=>{
                  countMap.set(k,data.filter(d=>d.status===k).length);
                });                
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
                this.chartData.countMap=countMap;                
              }else{
                this.chartData.total=0;
                this.chartData.sumMap=null;
                this.chartData.countMap=null;                
              }
              this.$refs.checkChart.draw();
            }
          }).catch(error=>{
            this.$message.error('统计数据获取出错！');
            console.log(error);
          });
          break;
        //附件
        case '2':          
          this.$refs.attachments.activeTab='1';
          break;
        //查看详情
        case '3':          
          if(this.dataForTabs.showType===2){
            this.detailLoading=true;
            get('/attachs/getAllFmtonAttach/'+this.dataForTabs.id+'/'+this.DB).then(res=>{
              if(res.code===1){
                const data=res.data;
                this.detailLoading=false;
                if(data.length){
                  this.thumbnails=new Map(data.map(d=>[d.step.split('to')[1]*1,d.file_name+'.'+d.file_type]));                
                  const {mime_type,blob_data,file_name,file_type,thumbnail,thumbnail_type}=data.filter(d=>d.step.split('to')[1]*1===d.status)[0];
                  this.lastFile={
                    fileProp:file_name+'.'+file_type,
                    imgSrc:(thumbnail_type&&thumbnail)?`data:image/${thumbnail_type};base64,` + thumbnail:'',
                    bolbUrl:[blob_data,mime_type]
                  }
                }
              }
            });
          }          
          break;
        //流程文件
        case '4':          
          this.$nextTick(()=>{
            this.$refs.processFile.activeTab='1';
          });
          break;
      };
      switch(oName){        
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
      this.$emit('update:activeTab');
      this.$emit('update:lastLayer');
      this.$refs.checkChart&&this.$refs.checkChart.clearChart();
      this.$refs.attachments&&this.$refs.attachments.clear();
      this.$refs.checkDetail&&this.$refs.checkDetail.clear();
      this.$refs.processFile&&this.$refs.processFile.clear();
    },              
    getData(){
      this.$emit('update:files');
    }
  }
}
</script>

<style lang="scss" scoped>
.tabsBox{
  width: 100%;
  margin: 0 auto;

  background-color: #fff;
  border-radius: 8px;
    
  .el-button{
    position: absolute;
    top:5px;
    right: 20px;
    color:#303133;
    font-size:16px;
  }

  .title{
    padding:10px;
    font-size: 18px;
    font-weight: bold;
  }
  .content{
    height:600px;
  }

}
</style>