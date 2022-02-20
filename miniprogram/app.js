// app.js
App({
  data:{
    c_mlog:null,
    wx_file:null,
    c_myun:null,
    c_mdb:null
  },
  onLaunch: function () {
    //init log
    try{
      this.data.c_mlog=require("common/wx/mlog.js")
      this.data.c_mlog.f_static_init(this.data.c_mlog.f_static_get_types().INFO)
      try{
        this.data.wx_file=require("common/wx/wx_file.js")
        this.data.c_myun=require("common/wx/myun.js")
        this.data.c_myun.f_static_init()
        this.data.c_mdb=require("common/wx/local_db.js")
        this.data.c_mdb.f_static_init("db_pepper")
      }catch (e1){
        this.data.c_mlog.f_static_err(e1)
      }
    }catch (e){
      console.error(e)
    }
  }
});
