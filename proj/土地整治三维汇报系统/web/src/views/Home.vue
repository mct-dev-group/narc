<template>
  <div class="home">
    <Matrix />

    <leftTree/>
    <LayerControl/>
    <Compass />

    <PlugManager />
    <!-- 插件start -->
    <Measurement />
    <PBFastReader />
    <searchWMSdb />
    <!-- 插件end -->
  </div>
</template>

<script>
import Matrix from '@/components/Matrix.vue';
import Compass from '@/components/ui/Compass.vue';
import PlugManager from '@/components/PlugManager.vue';
import LayerControl from '@/components/ui/LayerControl.vue';

// 插件
import Measurement from '@/components/plug/Measurement.vue';
import PBFastReader from '@/components/plug/PBFastReader.vue';
import leftTree from '@/components/ui/leftTree.vue';
import searchWMSdb from '@/components/plug/searchWMSdb.vue';

export default {
  name: 'home',
  data(){
    return {
      configError:false
    }
  },
  watch:{
    configError:function(){
      if(this.configError){
        this.$message.error('配置信息有误！');
        this.$router.replace('/');
      }
    }
  },
  components: {
    Matrix,
    Compass,
    leftTree,
    LayerControl,

    PlugManager,
    // 插件
    Measurement,
    PBFastReader,
    searchWMSdb
  },
  created () {
    const mapping=[
      ['db','setCurrentDB'],
      ['title','setSystemName'],
      ['pbUrls','setPbUrls'],
      ['indexCameraParam','setIndexCameraParam'],
      ['geoServices','setGeoServices']
    ];
    
    mapping.forEach(a=>{      
      const [k,v]=a;
      if(k in this.$route.params){
        if(!this.$route.params[k]){
          this.configError=true;
          return
        }
        this.$store.commit(v, this.$route.params[k]);
      }else{
        this.configError=true;
      }
    });
  }
}
</script>
<style lang="scss" scoped>
.home {
  height: 100vh;
}
</style>
<style>
.el-message{
  z-index:9999 !important;
}
</style>