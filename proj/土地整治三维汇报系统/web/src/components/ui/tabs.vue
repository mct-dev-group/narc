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
            get('/attachs/getPlanById/'+this.dataForTabs.id+'/'+this.DB).then(async res=>{              
              if(res.code===1){
                const data=res.data;                
                if(data.length){
                  const d=data[0];
                  let thumbnails=[];                  
                  for (let k of config.spotStatusChange.keys()) {
                    const lk=k.toLowerCase();                    
                    const fid=d[lk],tid=d[lk+'_thumbnail'];
                    if(!fid) continue;
                    const fname=(await get('/attachs/getAttachmentNameById/'+fid+'/'+this.DB)).data;
                    const tname=tid?(await get('/attachs/getAttachmentNameById/'+tid+'/'+this.DB)).data:'';
                    thumbnails.push([lk.split('to')[1]*1,{fid,tid,fname,tname}]);
                  }
                  const map=new Map(thumbnails);
                  this.thumbnails=map;
                  const last=Math.max.apply(null,[...map.keys()]);
                  const lid=d['f'+(last-1)+'to'+last+'_thumbnail'];
                  const lastData=map.get(last);                    
                  const imgName=(await get('/attachs/getAttachmentNameById/'+lid+'/'+this.DB)).data;                    
                  this.lastFile={
                    fileProp:lastData.fname,
                    imgSrc:lid?config.baseUrl+'attachs/getAttachmentById/'+lid+'/'+this.DB+'/'+imgName:'',
                    download:[lastData.fid,lastData.fname]
                  }                  
                }
              }else{
                this.$message.error(`获取流程文件出错！`+res.data);
              }
            }).catch(err=>{
              console.error(err);
            }).finally(()=>{
              this.detailLoading=false;
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