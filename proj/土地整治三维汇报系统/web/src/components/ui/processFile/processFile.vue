<template>
  <div class="processFile">
    <el-tabs 
      tab-position='left' 
      style="height: 360px;" 
      :value='activeTab' 
      :before-leave='handleBeforeLeave'
    >
    <el-tab-pane label="文件上传" name='1' style='height:100%;'>
      <uploadProcessFile  ref='uploadProcessFile' :gid='gid' />
    </el-tab-pane>
    <el-tab-pane label='文件查看' name='2' style='height:100%;padding-right:10px;'>
      <checkProcessFile v-loading='loading'  element-loading-text="加载中..." ref='checkProcessFile' :gid='gid' :processFiles='files' />
    </el-tab-pane> 
    </el-tabs>
  </div>
</template>

<script>
import {get} from '@/utils/fetch';
import {arr1Dto2D} from '@/utils/common';
import uploadProcessFile from './uploadProcessFile';
import checkProcessFile from './checkProcessFile';

export default {
  name: 'processFile',
  data(){
    return {
      activeTab:'0',
      files:null,
      loading:true,
      DB:this.$store.state.db,      
    }
  },
  props:['gid'],
  components:{
    uploadProcessFile,
    checkProcessFile
  },
  methods: {
    handleBeforeLeave(aName,oName){
      if(aName==='2'){
        this.loading=true;
        get("/attachs/getAttachmentListById/" +this.gid+'/'+this.DB).then(res=>{
          let data=res.data.filter((file)=>[...config.spotStatusChange.keys()].includes(file.attach_type));
          data.forEach(f=>{
            f.icon='fa fa-file-zip-o';
          });
          this.files=arr1Dto2D(data,3);
          this.loading=false;
        });
      }
    },    
    clear(){
      this.activeTab='0';
      this.files=null;
    }
  }
}
</script>

<style lang="scss" scoped>
.processFile{
  /deep/.el-tabs__content{
    height: 100%;
  }
}
 
</style>