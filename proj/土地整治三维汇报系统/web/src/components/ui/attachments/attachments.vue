<template>
  <div class="attachments">
    <el-tabs 
      tab-position='left'
      style="height: 540px;"
      :value='activeTab'
      :before-leave='handleBeforeLeave'
    >
    <el-tab-pane label="附件上传" name='1' style='height:100%;'>
      <uploadATT  ref='uploadATT' :gid='gid' />
    </el-tab-pane>
    <el-tab-pane label='附件查看' name='2' style='height:100%;padding-right:10px;'>
      <checkATT v-loading='loading' element-loading-text="加载中..." ref='checkATT' :gid='gid' :files='files'/>
    </el-tab-pane> 
    </el-tabs>
  </div>
</template>

<script>
import axios from 'axios';
import uploadATT from './uploadATT';
import checkATT from './checkATT';

export default {
  name: 'attachments',
  data(){
    return {
      activeTab:'0',
      loading:true,
      DB:this.$store.state.db,
      files:null,
      source:null,
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
      this.files=null;
      this.source&&this.source.cancel('request canceled .');
      this.source=null;
    },
    handleBeforeLeave(aName,oName){
      if(aName==='2'){
        this.loading=true;
        this.source=axios.CancelToken.source();
        axios.get("/attachs/getAttachmentListById/" +this.gid+'/'+this.DB,{cancelToken: this.source.token}).then(res=>{          
          this.files=res.data.data.filter(r=>![...config.spotStatusChange.keys()].includes(r.attach_type));
          this.loading=false;
        }).catch(error=>{
          console.error(error);
          this.source.cancel('request canceled .');
        });
      }
      if(oName==='2'){
        this.source&&this.source.cancel('request canceled .');
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