// app.js
App({
  data:{
    module_log:null,
    wx_file:null,
    module_yun:null,
    module_db:null
  },
  onLaunch: function () {
    try{
      //init log
      this.data.module_log=require("common/wx/mlog.js")
      this.data.module_log.f_static_init(this.data.module_log.f_static_get_log_types().INFO)
      this.f_err=this.data.module_log.f_static_err
      this.f_info=this.data.module_log.f_static_info
      //init all module
      this.data.wx_file=require("common/wx/wx_file.js")
      this.data.module_yun=require("common/wx/myun.js")
      this.data.module_yun.f_static_init()
      this.data.module_db=require("common/wx/local_db.js")
      this.data.module_db.f_static_init("db_pepper")
    }catch (e){
      this.f_err(e)
      this.data.module_log.f_static_show_loading({title:"app.js初始化失败,请退出重新打开试试!",mask:true})
    }
  },
  f_err:(e)=>console.error(e),
  f_info:(info_str)=>console.info(info_str)
});
