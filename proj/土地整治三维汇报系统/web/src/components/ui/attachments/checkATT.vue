<template>
  <div class="checkATT">
    <div v-if='attachments&&attachments.length>0' >
      <el-row v-for="(item,index) of attachments" :key='index'>
        <el-col v-for="(val,i) of item" :key='i' :span="8">
          <el-card shadow='hover' :body-style="{padding:0}" >
            <img :src="val.url" :alt="val.name" :title="val.name" class="imgATT" @click="openInNewtab(val.url)">
            <a class="fileLink" @click="openInNewtab(val.url)" :title='val.name'>{{val.name}}</a>
          </el-card>          
        </el-col>
      </el-row>      
    </div>
    <p v-else>暂无其他附件</p>
  </div>
</template>

<script>
import {get} from '@/utils/fetch';
import {arr1Dto2D} from '@/utils/common';

export default {
  name: 'checkATT',
  data () {
    return {
      DB:this.$store.state.db
    }
  },
  props:['gid','files'],
  computed:{
    attachments:function(){
      if(this.files){
        let files=this.files.filter(file=>![...config.spotStatusChange.keys()].includes(file.attach_type));
        let arr=files.map(f=>{
          const {file_name,file_type,mime_type, blob_data} = f;
          return {
            name:file_name+'.'+file_type,
            url:`data:${mime_type};base64,` + blob_data
          }
        });
        
        return arr1Dto2D(arr,3);
        // return [];
      }else{
        return [];
      }
    }
  },
  methods: {
    handleFileClick(gid){
      get("/attachs/getAttachmentById/"+gid+"/"+this.DB).then(res=>{
        const {mime_type, blob_data} = res.data[0];
        const bolbUrl=`data:${mime_type};base64,` + blob_data;
        openInNewtab(bolbUrl);
      });
    },
    openInNewtab(dataURL){
      const iframe =
        "<iframe width='100%' height='100%' style='border:none;' src='" + dataURL + "'></iframe>";
      let x = window.open();

      x.document.open();
      x.document.write(iframe);
      x.document.body.style.margin=0;
      x.document.close();
    }
  }
}
</script>

<style lang="scss" scoped>
.checkATT{
  height: 100%;
  overflow-y: auto;

  .el-row~.el-row {
    margin-top: 20px;    
  }
  .el-col{
    padding:0px;

    .el-card{
      cursor: pointer;

      .imgATT{
        display: block;
        width: 100%;
        height: 160px;
      }

        
    }
  } 

  a.fileLink{
    font-size: 16px;
    text-align: center;
    text-decoration: none;
    color: #606266;
    display: block;
    white-space: nowrap;
    overflow-x: hidden;
    text-overflow: ellipsis;
    padding:5px;

    &:hover{
      color: #409eff;
    }    
  }
}

</style>