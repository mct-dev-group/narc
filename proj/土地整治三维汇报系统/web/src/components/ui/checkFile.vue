<template>
  <div class="checkFile">
    <el-tabs
      tab-position='left'
      :value='activeTab'
      style="height: 340px;"
      :before-leave='handleBeforeLeave'
    >
      <el-tab-pane label="流程文件" name='1' >
        <div v-if="processFiles.length>0">
          <el-row v-for="(item,index) of processFiles" :key='index'>
            <el-col v-for="(val,i) of item" :key='i' :span="8">
              <el-card shadow='hover' :body-style='{padding:"5px"}'>
                <p>{{spotStatusChange.get(val.step)}}</p>
                <div @click="handleProcessFileClick(index,i)">
                  <a class="fileLink"><i class='fa fa-file-zip-o'></i>{{val.file_name}}.{{val.file_type}}</a> 
                </div>
                
              </el-card>
              
            </el-col>
          </el-row>
        </div>
        <div v-else>
          暂无流程文件
        </div>
      </el-tab-pane>
      <el-tab-pane label='其他' style='height:100%;padding-right:10px;' name='2'>
        <ul v-if='otherFiles' class='fileList'>
          <li v-for='file in otherFiles' :key='file.gid' @click="handleFileClick(file.gid,$event)" title='点击查看'>
            <a class="fileLink"><i :class='file.icon'></i>{{file.file_name}}.{{file.file_type}}</a>
          </li>
        </ul>
        <p v-else>暂无其他附件</p>
      </el-tab-pane>
    </el-tabs>
    <el-dialog :visible.sync="dialogVisible" :append-to-body='true'>
      <img width="100%" :src="dialogImageUrl" alt="">
    </el-dialog>
  </div>
</template>

<script>
import {get} from '@/utils/fetch';
import {arr1Dto2D} from '@/utils/common';

export default {
  name: 'checkFile',
  data () {
    return {
      activeTab:'',
      urlOfBefore:'',
      urlOfAfter:'',
      dialogImageUrl:'',
      dialogVisible:false,
      spotStatusChange:config.spotStatusChange,
      processFiles:[],
      DB:''
    }
  },
  mounted(){
    this.DB=this.$store.state.db;
  },
  props:['showType','gid','files','planId'],
  computed:{
    otherFiles:function(){
      if(this.files){
        let files=this.files.filter(file=>file.attach_type!=='zzq_img'&&file.attach_type!=='zzh_img');
        files.forEach(file=>{
          switch(file.file_type){
            case 'jpg':
            case 'png':
            case 'gif':
              file.icon='fa fa-file-image-o';
              break;
            case 'xls':
            case 'xlsx':
              file.icon='fa fa-file-excel-o';
              break;
            case 'doc':
            case 'docx':
              file.icon='fa fa-file-word-o';
              break;
            case 'zip':
            case 'rar':
              file.icon='fa fa-file-archive-o';
              break;
            default :
              file.icon='fa fa-file-o';
          }
        });
        return files;
      }
    }
  },
  methods: {
    handleBeforeLeave(aName,oName){      
      if(aName==='1'){
        if(!this.planId){
          this.processFiles=[];
          this.$emit('update:checkLoading');
          return;
        }
        if(this.showType===2){
          get('/attachs/getAllFmtonAttach/'+this.planId+'/'+this.DB).then(res=>{
            let data=res.data;
            this.processFiles=arr1Dto2D(data,3);
            this.$emit('update:checkLoading');
          }).catch(error=>{
            console.log(error);
          }).finally(()=>{

          });
        }else{
          this.$emit('update:checkLoading');
        }                
      }else if(aName==='2'){
        this.$emit('update:checkLoading');
      }
    },
    handleProcessFileClick(m,n){
      let file=this.processFiles[m][n];
      const bolbUrl=`data:${file.mime_type};base64,` + file.blob_data;
      openInNewtab(bolbUrl);
    },
    handleFileClick(gid,evt){
      get("/attachs/getAttachmentById/"+gid+"/"+this.DB).then(res=>{
        const {mime_type, blob_data} = res.data[0];
        const bolbUrl=`data:${mime_type};base64,` + blob_data;
        openInNewtab(bolbUrl);
      });
    },    
    clearFile(){
      this.urlOfBefore='';
      this.urlOfAfter='';
      // this.activeTab='';
      this.processFiles=[];
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
</script>

<style lang="scss" scoped>

.checkFile{
  /deep/.el-tabs__content{
    height: 100%;
  }
  
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