<template>
  <div class="checkATT">
    <ul v-if='attachments&&attachments.length>0' class='fileList'>
      <li v-for='file in attachments' :key='file.gid' @click="handleFileClick(file.gid)" title='点击查看'>
        <a class="fileLink"><i :class='file.icon'></i>{{file.file_name}}.{{file.file_type}}</a>
      </li>
    </ul>
    <p v-else>暂无其他附件</p>
  </div>
</template>

<script>
import {get} from '@/utils/fetch';

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
        files.forEach(file=>{
          file.icon=getIcon(file.file_type);
        });
        return files;
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
    clearFile(){
      
    }
  }
}
function openInNewtab(dataURL) {
  var iframe =
    "<iframe width='100%' height='100%' style='border:none;' src='" + dataURL + "'></iframe>";
  var x = window.open();

  x.document.open();
  x.document.write(iframe);
  x.document.body.style.margin=0;
  x.document.close();
}
function getIcon(type){
  let result='fa fa-';
  switch(type){
    case 'jpg':
    case 'png':
    case 'gif':
      result+='file-image-o';
      break;
    case 'xls':
    case 'xlsx':
      result+='file-excel-o';
      break;
    case 'doc':
    case 'docx':
      result+='file-word-o';
      break;
    case 'zip':
    case 'rar':
      result+='file-archive-o';
      break;
    case 'txt':
      result+='file-text-o';
      break;
    default :
      result+='file-o';
  }
  return result;
}
</script>

<style lang="scss" scoped>
.checkATT{
  height: 100%;

  .el-row~.el-row {
    margin-top: 20px;    
  }
  .el-col{
    padding:0px;

    .el-card{
      height: 80px;      
      position: relative;

      p{
        font-size: 16px;
        font-weight: bold;
        text-align: center;
      }
      p+div{
        font-size: 16px;
        margin-top:10px; 
        padding:8px 5px;
        cursor: pointer;        
      }
    }
  }

  .fileList {
    list-style: none;
    padding: 0;
    height: 100%;
    overflow-y: auto;

    >li{
      margin-bottom:10px;
      padding:8px 5px;
      cursor: pointer;
      user-select:none;
    }
    >li:hover{
      background-color: #f5f7fa;
    }
    >li:last-child{
      margin-bottom:0;
    }   
  }

  a.fileLink{
    font-size: 16px;
    padding-left:4px;
    text-decoration: none;
    color: #606266;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:hover{
      color: #409eff;
    }

    i{
      margin-right:8px;
    }
  }
}

</style>