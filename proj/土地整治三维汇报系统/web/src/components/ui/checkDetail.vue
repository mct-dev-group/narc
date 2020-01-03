<template>
  <div class="checkDetail">   
    <el-container style="height:100%;" v-if="showType===2">
      <el-aside width="120px">
        <el-steps direction='vertical' finish-status="success" align-center :active="status===spotStatus.length?status:(status-1)" >
          <el-step v-for='(item,index) of spotStatus' :key='index'>              
            <div v-if='index>0&&index<spotStatus.length&&index<=(status-1)' slot="title" @click="checkExtendProps(item[0])">{{item[1]}}</div>
            <div v-else slot="title">{{item[1]}}</div>        
            <div v-if="index>0&&index<spotStatus.length&&index<=(status-1)" slot="description" @click="checkExtendProps(item[0])" :title="thumbnails?thumbnails.get(item[0]):''">{{thumbnails?thumbnails.get(item[0]):''}}</div>                
          </el-step>
        </el-steps>
      </el-aside>
      <el-main style="padding:0 5px;">
        <div class="downloadFileBox">
          <el-row>
            <el-col :span=7>对应流程文件：</el-col>
            <el-col :span=17>
              <el-link v-if="fileProp!==''" type="primary" style="max-width:100%;" @click="download" :title="fileProp">{{fileProp}}</el-link>
              <div v-else>数据未录入</div>
            </el-col>
          </el-row>
        </div>
        <div style="text-align:center;">
          <el-image :src="imgSrc" style="width:640px;height:480px;" v-loading='imgLoading'>
            <div slot="error" class="el-image__error">暂无缩略图</div>
            <div slot="placeholder" class="el-image__placeholder">暂无缩略图</div>
          </el-image>
        </div>
        
        <div class="propsContainer"  v-if='basicProps.length>0'>
          <el-row  v-for="(item,index) of basicProps" :key='index'>
            <el-col :span="8" v-for="(prop,i) of item" :key='i'>
              <el-row>
                <el-col class="text-right" :span='12'><span :title="prop[0]">{{prop[0]}}&nbsp;：</span></el-col>
                <el-col :span='12'><span :title="(prop[0]==='status'?spotStatusMap.get(prop[1]):prop[1])||'暂无数据'">{{(prop[0]==='status'?spotStatusMap.get(prop[1]):prop[1])||'暂无数据'}}</span></el-col>
              </el-row>
            </el-col>        
          </el-row>
        </div>
      </el-main>
    </el-container>    
    <div class="propsContainer"  v-if='basicProps.length>0&&showType!==2'>
      <el-row  v-for="(item,index) of basicProps" :key='index'>
        <el-col :span="8" v-for="(prop,i) of item" :key='i'>
          <el-row>
            <el-col class="text-right" :span='12'><span :title="prop[0]">{{prop[0]}}&nbsp;：</span></el-col>
            <el-col :span='12'><span :title="(prop[0]==='status'?spotStatusMap.get(prop[1]):prop[1])||'暂无数据'">{{(prop[0]==='status'?spotStatusMap.get(prop[1]):prop[1])||'暂无数据'}}</span></el-col>
          </el-row>
        </el-col>        
      </el-row>
    </div>
    
  </div>
</template>

<script>
import {get,post} from '@/utils/fetch';
import {arr1Dto2D} from '@/utils/common';
import evenBus from '@/utils/event_bus';
import { setStatus } from '@/api/api';

export default {
  name: 'checkDetail',
  data () {
    return {
      status:this.details?this.details.status:1,
      spotStatusMap:config.spotStatus,
      spotStatusChange:config.spotStatusChange,      
      innerDialog:false,      
      radio:'',
      errors:[],
      fileProp:'',      
      bolbUrl:[],
      imgSrc:'',
      imgLoading:false,
      DB:this.$store.state.db
    }
  },  
  props:['details','showType','thumbnails','lastFile'],
  computed:{
    spotStatus:function(){
      return [...this.spotStatusMap];
    },    
    basicProps:function(){
      if(this.details){        
        const filteredData=Object.entries(this.details).filter(f=>{
          let [key]=f;          
          let regExpArr=[...config.spotStatusChange.keys()].filter(v=>new RegExp('^'+v,'ig').test(key));          
          return key!=='geom'&&regExpArr.length<1;
        });
        return arr1Dto2D(filteredData,3);
      }else{
        return [];
      }
    }
  },
  watch:{
    details:function(){
      if(this.details){        
        this.status=this.details.status;
      }      
    },
    lastFile:function(){
      if(this.lastFile){
        this.imgSrc=this.lastFile.imgSrc;
        this.fileProp=this.lastFile.fileProp;
      }      
    },
  },
  methods: {    
    clear(){      
      this.status=1;
      this.$emit('update:details', null);      
      this.radio='';
      this.errors=[];
      this.fileProp='';      
      this.bolbUrl=[];
      this.imgSrc='';
      this.imgLoading=false;
    },
    checkExtendProps(status){      
      if(status>1){
        this.imgLoading=true;
        get(`/attachs/getF${status-1}to${status}Attach/${this.details.gid}/${this.DB}`).then(res=>{
          if(res.code===1){            
            const data=res.data;
            const {mime_type,blob_data,file_name,file_type,thumbnail_type,thumbnail} = data;            
            this.bolbUrl=[blob_data,mime_type];
            this.fileProp=file_name+'.'+file_type;
            this.imgSrc=(thumbnail_type&&thumbnail)?`data:image/${thumbnail_type};base64,` +thumbnail:'';
            this.imgLoading=false;
          }else{
            this.$message.error(`获取流程文件出错！`);
            throw new Error();
          }
        }).catch(error=>{
          console.log(error);
        });
      }            
    },
    download(){
      //download      
      let eleLink = document.createElement('a');
      eleLink.download = this.fileProp;
      eleLink.style.display = 'none';
      // 将base64解码
      var bytes = atob(this.bolbUrl[0]);
      let n = bytes.length;        
      var byteArray = new Uint8Array(n);
      while (n--) {
        byteArray[n] = bytes.charCodeAt(n);
      }
      let blob = new Blob([byteArray],{type : this.bolbUrl[1]});
      eleLink.href =URL.createObjectURL(blob);      
      // 触发点击
      document.body.appendChild(eleLink);
      eleLink.click();
      URL.revokeObjectURL(eleLink.href);
      document.body.removeChild(eleLink);
    },
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
  height: 540px;
  padding:5px  10px 0 10px;  
  overflow: hidden;

  .el-main .downloadFileBox /deep/.el-row{
    border-top:1px solid #eaeefb;
    border-bottom:1px solid #eaeefb;
    margin-bottom: 5px;
  }
  .el-main .downloadFileBox /deep/.el-row .el-col{
    padding: 5px;
    text-align: center;

     /deep/.el-link{
      max-width: 100%;

      >span{
        overflow-x:hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
    }
  }

  .el-steps{     
    user-select: none;

    /deep/.el-step__title.is-process,/deep/.el-step__description,/deep/.el-step__title.is-success{
      cursor: pointer;
    }
    /deep/.el-step__main{
      overflow-x: hidden;
    }
    /deep/.el-step__description>div{
      overflow-x: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  /deep/.propsContainer{
    width:100%;    
    overflow-x: hidden;
    overflow-y: auto;
    margin-top: 5px;
    border-top: 1px solid #eaeefb;
    border-bottom: 1px solid #eaeefb;
    
    .el-row~.el-row {
      margin-top: 10px;    
    }
    .el-col{
      padding:0 5px;
      height: 25px;
      line-height: 25px;      
    }

    .text-right{
      text-align: right;
    }
  }
  .el-col{
    overflow-x: hidden;
    white-space: nowrap;    
    text-overflow: ellipsis;
  }
}
</style>