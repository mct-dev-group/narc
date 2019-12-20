<template>
  <div class="uploadProcessFile">
    <el-row v-for="(item,index) of itmesOfChanges" :key='index'>
      <el-col :span="8" v-for="(val,i) of item" :key='i'>
        <el-card shadow='hover'>          
          <p  class="cardTitle">{{val[1]}}</p>          
          <el-upload
            :ref='val[0]'
            action
            accept='application/zip'
            :limit='1'
            :auto-upload='false'
            :on-change='(file,fileList)=>{handleChange(file,fileList,val[0])}'
            :on-exceed='(files, fileList)=>{handleExceed(files, fileList,val[0])}'
            :on-remove='(files, fileList)=>{handleRemove(files, fileList,val[0])}'
          >
            <el-button type="info" icon='el-icon-plus' size="small" slot="trigger">添加</el-button>
            <el-button type="primary" icon='el-icon-upload' size="small" @click="handleUpload(val[0],val[1])">上传</el-button>
            <div slot="tip" class="el-upload__tip">请上传.zip文件。</div>
          </el-upload>
        </el-card>
      </el-col>
    </el-row>
    <el-dialog
      title="错误信息"
      :visible.sync="dialogVisible"
      :append-to-body='true'
      center
    >
      <div v-for="(err,i) of errors" :key='i' class="errorItem">
        <div>{{err.error}}</div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {get,post} from '@/utils/fetch';
import {arr1Dto2D} from '@/utils/common';

export default {
  name: 'uploadProcessFile',
  data(){
    return {
      dialogVisible:false,
      fileMap:new Map(),      
      spotStatusChange:[...config.spotStatusChange],
      errors:[],
      DB:this.$store.state.db
    }
  },
  props:['gid'],
  computed:{
    itmesOfChanges:function(){          
      return arr1Dto2D(this.spotStatusChange,3);
    }
  },
  methods: {
    clear(){
      this.fileMap.clear();
      this.errors=[];
    },
    handleChange(file,fileList,type){        
      if(file.name.split(".").pop()==='zip'){
        if(file.size>config.uploadMaxSize){
          this.$message.error('文件大小不能超过'+config.uploadMaxSize/1024/1024+'M！');
          this.$refs[type][0].clearFiles();
          return
        }
        this.fileMap.set(type,file.raw);
      }else{
        this.$message.error('请选择文件格式为.zip的文件上传！');
        this.$refs[type][0].clearFiles();
      }
    },
    handleExceed(file,fileList,type){
      this.$message.error('只能选择一个文件上传！');
    },
    handleRemove(file,fileList,type){
      this.fileMap.has(type)&&this.fileMap.delete(type);
    },
    handleUpload(type,typeName){
      if(this.fileMap.has(type)){
        let file=this.fileMap.get(type);
        const fileInfo = file.name.split(".");
        const file_type = fileInfo.pop();
        const file_name = fileInfo.join(".");
        const fd = new FormData();
        fd.append("file_name", file_name);
        fd.append("file_type", file_type);
        fd.append("attach_to_id", this.gid);
        fd.append("attach_type", type);
        fd.append("DB", this.DB);
        fd.append(type, file);
        const loading = this.$loading({
          lock: true,
          text: '上传中...',
          customClass:'test',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });
        post("/attachs/post"+type,fd).then(res=>{          
          if(res.code===1){
            this.$message.success(`${typeName}文件上传成功！`);
            return get('/geom/updateStatusForCountry/'+this.DB);
          }else{
            this.$message.error(`Error！`);
            this.errors=res.data;
            this.dialogVisible=true;
            throw new Error('error');
          }
        }).then(res=>{
          if(res.code!==1){
            this.$message.error(`图层更新出错！`);
            throw new Error('图层更新出错！');
          }
        }).catch(error=>{
          console.error(error);
        }).finally(()=>{
          loading.close();
          this.$refs[type][0].clearFiles();
        });
      }else{
        this.$message.error(`${typeName}文件为空！请选择文件后上传！`);
        return;
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.uploadProcessFile{
  box-sizing: border-box;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  user-select: none;
  padding-bottom:10px;

  .cardTitle{
    text-align: center;
    font-size: 1.2rem;
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  .el-row~.el-row {
    margin-top: 20px;    
  }
  .el-col{
    padding:0px;

    .el-card{
      height: 130px;
      text-align: center;
      position: relative;

      /deep/.el-card__body{
        padding:5px;
      }

      /deep/.el-upload +.el-button{
        margin-left: 5px;
      }

      /deep/.el-upload__tip,/deep/.el-upload-list{
        text-align:left;
      }      
    }
  }
}
.errorItem{
  margin-bottom:10px;
  font-size: 16px;
}
</style>