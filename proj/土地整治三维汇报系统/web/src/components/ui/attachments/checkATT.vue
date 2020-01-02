<template>
  <div class="checkATT">
    <div v-if='attachments&&attachments.length>0' >
      <el-row v-for="(item,index) of attachments" :key='index'>
        <el-col v-for="(val,i) of item" :key='i' :span="8">
          <el-card shadow='hover' :body-style="{padding:0}" >
            <div v-if="/^image\//ig.test(val.mime_type)">
              <img :src="val.url" :alt="val.name" :title="val.name" class="fileView" @click="viewFile(val.mime_type,val.blob_data,val.name)">
            </div>
            <div v-else>
              <i class="fileView" :class="getIcon(val.file_type)" @click="viewFile(val.mime_type,val.blob_data,val.name)"></i>
            </div>
            <div></div>            
            <a class="fileLink" @click="viewFile(val.mime_type,val.blob_data,val.name)" :title='val.name'>{{val.name}}</a>
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
            url:`data:${mime_type};base64,` + blob_data,
            blob_data:blob_data,
            file_type:file_type,
            mime_type:mime_type
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
    viewFile(type,dataURL,name){
      if(/^image\//ig.test(type)){
        const url=`data:${type};base64,` + dataURL;
        const img ="<img  style='border:none;height:100%;' src='" + url + "'/>";
        let x = window.open();        
        x.document.write(img);
        x.document.body.style.margin=0;
        x.document.close();
      }else{
        //download        
        var eleLink = document.createElement('a');
        eleLink.download = name;
        eleLink.style.display = 'none';
        // 将base64解码
        var bytes = atob(dataURL);
        let n = bytes.length;        
        var byteArray = new Uint8Array(n);
        while (n--) {
          byteArray[n] = bytes.charCodeAt(n);
        }
        let blob = new Blob([byteArray],{type : type});
        eleLink.href =URL.createObjectURL(blob);
        // 触发点击
        document.body.appendChild(eleLink);
        eleLink.click();
        URL.revokeObjectURL(eleLink.href);
        document.body.removeChild(eleLink);        
      }
      
    },
    getIcon(type){
      let result='fa fa-';
      switch(type){
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
        case 'pdf':
          result+='file-pdf-o';
          break;
        default :
          result+='file-o';
      }
      return result;
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

      .fileView{
        display: block;
        width: 100%;
        height: 160px;
      }
      i.fileView{
        box-sizing: border-box;             
        font-size: 150px;
        text-align: center;
        padding: 5px;
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