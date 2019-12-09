<template>
  <div class="checkDetail">
    <el-steps finish-status="success" align-center :active="status===spotStatus.length?status:(status-1)" v-if="showType===2">
      <el-step v-for='(item,index) of spotStatus' :key='index'>              
        <div v-if='index>0&&index<spotStatus.length&&index<=(status-1)' slot="title" @click="checkExtendProps(item[0])">{{item[1]}}</div>
        <div v-else slot="title">{{item[1]}}</div>        
        <div v-if="index>0&&index<spotStatus.length&&index<=(status-1)" slot="description" @click="checkExtendProps(item[0])">点击查看</div>                
      </el-step>
    </el-steps>
    <div v-if="tableProps.length>0">
      <el-table      
        style="width: 100%"
        :data="tableProps"
        size='small'
      >
        
        <el-table-column
          align='center'
          prop="file"
          label="对应流程文件"
          width="180">
        </el-table-column>
        <el-table-column
          align='center'
          label="操作"
          fixed="right"
        >
          <el-button type="text" @click="download">下载</el-button>          
        </el-table-column>
      </el-table>
    </div>
    <div class="propsContainer" v-bind:class="{'height-150': showType===2&&tableProps.length>0}" v-if='basicProps.length>0'>
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
      uploadFile:[],
      radio:'',
      errors:[],
      tableProps:[],
      downloadName:'',
      bolbUrl:'',
      DB:this.$store.state.db
    }
  },  
  props:['details','showType','closeTabsBox'],
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
    checkExtendProps(status){      
      if(status>1){
        get(`/attachs/getF${status-1}to${status}Attach/${this.details.gid}/${this.DB}`).then(res=>{
          if(res.code===1){
            const data=res.data;
            console.log(data);
            const {mime_type,blob_data,file_name,file_type} = data;
            this.downloadName=file_name+'.'+file_type;
            this.bolbUrl=`data:${mime_type};base64,` + blob_data;
            this.tableProps=[{
              file:file_name+'.'+file_type,              
            }];
          }else{
            throw new Error();
          }
        }).catch(error=>{
          console.log(error);
        });
      }            
    },
    download(){
      //download        
      var eleLink = document.createElement('a');
      eleLink.download = this.downloadName;
      eleLink.style.display = 'none';
      eleLink.href = this.bolbUrl;
      // 触发点击
      document.body.appendChild(eleLink);
      eleLink.click();        
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
  height: 340px;
  padding:5px  10px 0 10px;  
  overflow: hidden;

  >.el-steps{
    width:100%;    
    user-select: none;

    /deep/.el-step__title.is-process,/deep/.el-step__description,/deep/.el-step__title.is-success{
      cursor: pointer;
    }    
  }

  .el-table{
    width: 100%;
    margin-bottom: 5px;
  }

  .height-150{
    height: 150px;
  }

  >.propsContainer{
    width:100%;    
    overflow-x: hidden;
    overflow-y: auto;
    margin-top: 10px; 
    
    .el-row~.el-row {
      margin-top: 10px;    
    }
    .el-col{
      padding:0 5px;
      height: 25px;
      line-height: 25px;
      overflow-x: hidden;
      white-space: nowrap;    
      text-overflow: ellipsis;
    }

    .text-right{
      text-align: right;
    }
  }  
}
</style>