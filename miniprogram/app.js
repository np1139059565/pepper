// app.js
App({
  data:{
    module_log:null,
    wx_file:null,
    module_yun:null,
    module_db:null
  },
  onLaunch: function () {
    //init log
    try{
      this.data.module_log=require("common/wx/mlog.js")
      this.data.module_log.f_static_init(this.data.module_log.f_static_get_types().INFO)
      this.f_err=this.data.module_log.f_static_err
      this.f_info=this.data.module_log.f_static_info
      try{
        this.data.wx_file=require("common/wx/wx_file.js")
        this.data.module_yun=require("common/wx/myun.js")
        this.data.module_yun.f_static_init()
        this.data.module_db=require("common/wx/local_db.js")
        this.data.module_db.f_static_init("db_pepper")
      }catch (e1){
        this.data.module_log.f_static_err(e1)
      }
    }catch (e){
      this.f_err(e)
    }
  },
  f_err:(e)=>console.error(e),
  f_info:(info_str)=>console.info(info_str)
});
