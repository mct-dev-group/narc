<template>
  <div class="checkDetail">    
    <el-steps finish-status="success" align-center :active="status===spotStatus.length?status:(status-1)" v-if="showType===2">
      <el-step v-for='(item,index) of spotStatus' :key='index'>
        <div v-if='index<(spotStatus.length-1)&&index===(status-1)' slot="title" @click="showUploadDialog">{{item[1]}}</div>
        <div v-else slot="title">{{item[1]}}</div>
        <div v-if='index<(spotStatus.length-1)&&index===(status-1)' slot="description" @click="showUploadDialog">点击上传</div>        
      </el-step>
    </el-steps>
    <div class="propsContainer" v-bind:class="{'height-240': showType===2}">
      <div v-for='(val,key) in details' :key='key' v-if='key!=="geom"'>
        <span>{{key}}：</span>
        <div class="prop" >{{key==='status'?spotStatusMap.get(val):val}}</div>
      </div>
    </div>
    <el-dialog
      title="成果文件上传"
      :visible.sync="dialogVisible"      
      :close-on-click-modal='false'
      :before-close="handleBeforeClose"
      width="480px"
      center
      append-to-body
    >
      <el-dialog
        title="错误信息"
        :visible.sync="innerDialog"
        append-to-body
        center
      >
        <div v-for="(err,i) of errors" :key='i' class="errorItem">
          <div>{{err.error}}</div>
        </div>
      </el-dialog>      
      <div class="uploadCard">
        <el-row>
          <el-col :span='6'>
            <div v-if='spotStatusMapping.length>0'>
              <div v-for="(item,index) of spotStatusMapping" :key="index">
                <el-radio v-model="radio" :label="item">{{spotStatusChange.has(item)?spotStatusChange.get(item):'名称未定义'}}</el-radio>
              </div>
            </div>
            <div v-else class="error-text">
              无对应上传接口！请检查配置。
            </div>
          </el-col>
          <el-col :span='18'>
            <el-upload
              ref='upload'
              action
              accept='application/zip'
              :limit='1'
              :auto-upload='false'
              :on-change='handleChange'
              :on-exceed='handleExceed'
              :on-remove='handleRemove'
            >
              <el-button type="info" icon='el-icon-plus' slot="trigger">添加文件</el-button>
              <el-button type="primary" icon='el-icon-upload' class="margin-left-10" @click="handleUpload">上传至服务器</el-button>
              <div slot="tip" class="el-upload__tip">请上传.zip文件。</div>
            </el-upload>
          </el-col>
        </el-row>
      </div>      
    </el-dialog>
  </div>
</template>

<script>
import {post} from '@/utils/fetch';
import evenBus from '@/utils/event_bus';
import { setStatus } from '@/api/api';

export default {
  name: 'checkDetail',
  data () {
    return {
      status:this.details?this.details.status:1,
      spotStatusMap:config.spotStatus,
      spotStatusChange:config.spotStatusChange,
      dialogVisible:false,
      innerDialog:false,
      uploadFile:[],
      radio:'',
      errors:[],
      DB:''
    }
  },  
  props:['details','showType','closeTabsBox'],
  computed:{
    spotStatus:function(){
      return [...this.spotStatusMap];
    },
    spotStatusMapping:function(){
      const mapping=config.spotStatusMapping;
      let result=[];
      if(mapping.has(this.status)){
        const arr=mapping.get(this.status);
        result=Array.isArray(arr)?arr:[];
      }else{
        result=[];
      }
      return result;
    }
  },
  watch:{
    details:function(){
      if(this.details){
        this.status=this.details.status;
      }      
    }
  },
  methods: {    
    clear(){      
      this.status=1;
      this.$emit('update:details', null);
      this.uploadFile=[];
      this.radio='';
      this.errors=[];
    },
    showUploadDialog(){      
      this.dialogVisible=true;
    },
    handleChange(file,fileList){
      if(file.raw.type==='application/zip'){
        this.uploadFile.push(file.raw);
      }else{
        this.$message.error('请选择文件格式为.zip的文件上传！');        
        this.$refs.upload.clearFiles();
      }
    },
    handleExceed(file,fileList){
      this.$message.error('只能选择一个文件上传！');
    },
    handleRemove(file,fileList){
      this.uploadFile.pop();
    },
    handleUpload(){
      if(this.uploadFile.length<1){
        this.$message.error(`文件为空！请选择文件后上传！`);
        return;
      }
      if(this.radio===''){
        this.$message.error(`请在左侧选择上传类型!`);
        return;
      }
      if(this.uploadFile.length>0){
        const type=this.radio;
        let file=this.uploadFile.pop();
        const fileInfo = file.name.split(".");
        const file_type = fileInfo.pop();
        const file_name = fileInfo.join(".");
        const fd = new FormData();
        fd.append("file_name", file_name);
        fd.append("file_type", file_type);        
        fd.append("DB", this.DB);
        fd.append(type, file);
        post("/attachs/post"+type,fd).then(res=>{
          console.log(res);
          if(res.code===1){
            this.$message.success(`文件上传成功！`);
            this.dialogVisible=false;
            this.closeTabsBox();
          }else{
            this.errors=res.data;
            this.innerDialog=true;
          }
        }).catch(error=>{
          console.error(error);
        }).finally(()=>{
          this.$refs.upload.clearFiles();
        });
      }else{
        
      }
    },
    handleBeforeClose(done){
      this.$refs.upload.clearFiles();
      done();
    },      
  },
  mounted(){
    this.DB=this.$store.state.db;
  },
}

</script>

<style lang="scss" scoped>
div{
  box-sizing: border-box;
}
.margin-left-10{
  margin-left: 10px;
}
.error-text{
  color: #F56C6C;
}
.checkDetail{    
  height: 320px;
  margin: 10px;  
  overflow: hidden;

  >.el-steps{
    width:100%;
    margin-bottom:1rem;
    user-select: none;

    /deep/.el-step__title.is-process,/deep/.el-step__description{
      cursor: pointer;
    }    
  }

  .height-240{
    height: 240px;
  }

  >.propsContainer{
    width:100%;    
    overflow-x: hidden;
    overflow-y: auto;    
    display: flex;    
    flex-wrap: wrap;
  

    >div>span{
      width: 100px;      
      line-height: 40px;
      display: inline-block;
      padding-right:5px;
      font-size: 18px;
      text-align:right;      
    }
    >div>div.prop{      
      display: inline-block;
      height:40px;
      line-height: 20px;
      width: 150px;      
      padding:8px;
      vertical-align: middle;

    }
  }  
}
.uploadCard{  
  min-height: 100px;
}
.errorItem{
  margin-bottom:10px;
  font-size: 16px;
}
</style>