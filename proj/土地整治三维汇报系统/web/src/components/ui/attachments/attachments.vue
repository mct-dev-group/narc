<template>
  <div class="attachments">
    <el-tabs 
      tab-position='left'
      style="height: 360px;"
      :value='activeTab'
      :before-leave='handleBeforeLeave'
    >
      <el-tab-pane label="附件上传" name='1' style='height:100%;'>
      <uploadATT  ref='uploadATT' :gid='gid' />
    </el-tab-pane>
    <el-tab-pane label='附件查看' name='2' style='height:100%;padding-right:10px;'>
      <checkATT v-loading='loading' ref='checkATT' :gid='gid' :files='files'/>
    </el-tab-pane> 
    </el-tabs>
  </div>
</template>

<script>
import {get} from '@/utils/fetch';
import uploadATT from './uploadATT';
import checkATT from './checkATT';

export default {
  name: 'attachments',
  data(){
    return {
      activeTab:'0',
      loading:true,
      DB:this.$store.state.db,
      files:null
    }
  },
  props:['gid'],
  components:{
    uploadATT,
    checkATT
  },
  methods: {
    clear(){
      this.activeTab='0';      
    },
    handleBeforeLeave(aName,oName){
      if(aName==='2'){
        this.loading=true;
        get("/attachs/getAttachmentListById/" +this.gid+'/'+this.DB).then(res=>{
          this.files=res.data;
          this.loading=false;
        });
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.attachments{
  /deep/.el-tabs__content{
    height: 100%;
  }
}
 
</style>