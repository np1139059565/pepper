// app.js
App({
  data:{
    c_mlog:null
  },
  onLaunch: function () {
    //init log
    try{
      this.data.c_mlog=require("common/mlog.js")
      this.data.c_mlog.init1()
    }catch (e){
      console.error(e)
    }
  }
});
