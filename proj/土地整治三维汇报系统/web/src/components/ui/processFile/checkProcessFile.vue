<template>
  <div class="checkProcessFile">
    <div v-if="processFiles&&processFiles.length>0">
      <el-row v-for="(item,index) of processFiles" :key='index'>
        <el-col v-for="(val,i) of item" :key='i' :span="8">
          <el-card shadow='hover' :body-style='{padding:"5px"}'>
            <p>{{spotStatusChange.get(val.step||val.attach_type)}}</p>            
            <div @click="handleProcessFileClick(val.gid,val.file_name)" :title="val.file_name+'.'+val.file_type">
              <a class="fileLink"><i :class='val.icon'></i>{{val.file_name}}.{{val.file_type}}</a> 
            </div>
          </el-card>          
        </el-col>
      </el-row>
    </div>
    <div v-else>
      暂无流程文件
    </div>
  </div>
</template>

<script>
import {get} from '@/utils/fetch';

export default {
  name: 'checkProcessFile',
  data(){
    return {
      spotStatusChange:config.spotStatusChange,
      DB:this.$store.state.db
    }
  },
  props:['gid','processFiles'],
  methods: {
    handleProcessFileClick(gid,file_name){      
      get("/attachs/getAttachmentById/"+gid+"/"+this.DB).then(res=>{
        const {mime_type, blob_data} = res.data[0];
        const bolbUrl=`data:${mime_type};base64,` + blob_data;
        //download        
        var eleLink = document.createElement('a');
        eleLink.download = file_name;
        eleLink.style.display = 'none';
        eleLink.href = bolbUrl;
        // 触发点击
        document.body.appendChild(eleLink);
        eleLink.click();        
        document.body.removeChild(eleLink);
      });
    },    
  },
}
</script>

<style lang="scss" scoped>
.checkProcessFile{
  height: 100%;
  overflow-y: auto;
  
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