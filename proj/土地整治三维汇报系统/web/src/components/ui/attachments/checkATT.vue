<template>
  <div class="checkATT">
    <div v-if='attachments&&attachments.length>0' >
      <el-row v-for="(item,index) of attachments" :key='index'>
        <el-col v-for="(val,i) of item" :key='i' :span="8">
          <el-card shadow='hover' :body-style="{padding:0}" >
            <div v-if="['jpg','png','gif','jpeg'].includes(val.file_type)">
              <img :src="serverUrl+'attachs/getAttachmentById/'+val.gid+'/'+DB+'/'+val.name" :alt="val.name" :title="val.name" class="fileView" @click="viewFile(val.gid,val.name,val.file_type)">
            </div>
            <div v-else>
              <i class="fileView" :class="getIcon(val.file_type)" @click="viewFile(val.gid,val.name,val.file_type)"></i>
            </div>
            <div></div>            
            <a class="fileLink" @click="viewFile(val.gid,val.name,val.file_type)" :title='val.name'>{{val.name}}</a>
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
      serverUrl:config.baseUrl,
      DB:this.$store.state.db
    }
  },
  props:['gid','files'],
  computed:{
    attachments:function(){
      if(this.files){        
        let arr=this.files.map(f=>{
          const {file_name,file_type,gid,} = f;
          const name=file_name+'.'+file_type;
          return {
            name,
            gid,
            file_type,            
          }
        });        
        return arr1Dto2D(arr,3);        
      }else{
        return [];
      }
    }
  },
  methods: {   
    viewFile(gid,name,type){
      window.open(this.serverUrl+'attachs/getAttachmentById/'+gid+'/'+this.DB+'/'+name);      
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