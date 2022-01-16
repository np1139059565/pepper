// app.js
App({
  data:{
    c_mlog:null,
    c_mfile:null,
    c_myun:null,
    c_mdb:null
  },
  showModal:(title, content, ocallback, ccallback)=> {
  try{
    //ok,cancel
    wx.showModal({
      // title: conter,//titile 无换行
      content: content,
      showCancel: typeof ccallback == "function",
      confirmText: "确认",
      cancelText: "取消",
      success: (res) => {
        try {
          if (res.confirm) {
            if (typeof ocallback == "function") {
              ocallback()
            }
          } else if (res.cancel) {
            if (typeof ccallback == "function") {
              ccallback()
            }
          }
        } catch (e) {
          this.data.c_mlog.err(e)
        }
      }
    })
  }catch (e){
    this.data.c_mlog.err(e)
  }
},
  onLaunch: function () {
    //init log
    try{
      this.data.c_mlog=require("common/mlog.js")
      this.data.c_mlog.static_init()
      try{
        this.data.c_mfile=require("common/mfile.js")
        this.data.c_mfile.static_init(this.data.c_mlog)
        this.data.c_myun=require("common/myun.js")
        this.data.c_myun.static_init(this.data.c_mlog,this.data.c_mfile)
        this.data.c_mdb=require("common/mdb.js")
        this.data.c_mdb.static_init(this.data.c_mlog,this.data.c_myun,this.data.c_mfile)

      }catch (e1){
        this.data.c_mlog.err(e1)
      }
    }catch (e){
      console.error(e)
    }
  }
});
