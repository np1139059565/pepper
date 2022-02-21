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
      this.f_err=this.data.c_mlog.f_static_err
      this.f_info=this.data.c_mlog.f_static_info
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
      this.f_err(e)
    }
  },
  f_err:(e)=>console.error(e),
  f_info:(info_str)=>console.info(info_str)
});
