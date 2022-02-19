// app.js
App({
  data:{
    c_mlog:null,
    c_mfile:null,
    c_myun:null,
    c_mdb:null
  },
  onLaunch: function () {
    //init log
    try{
      this.data.c_mlog=require("common/wx/mlog.js")
      this.data.c_mlog.f_static_init()
      try{
        this.data.c_mfile=require("common/wx/mfile.js")
        this.data.c_myun=require("common/wx/myun.js")
        this.data.c_myun.static_init(this.data.c_mlog,this.data.c_mfile)
        this.data.c_mdb=require("common/wx/mdb.js")
        this.data.c_mdb.static_init(this.data.c_mlog,this.data.c_myun,this.data.c_mfile)
      }catch (e1){
        this.data.c_mlog.f_err(e1)
      }
    }catch (e){
      console.error(e)
    }
  }
});
