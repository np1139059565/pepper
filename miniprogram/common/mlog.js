const mfile=require("common/mfile.js")

module.exports.init1 = function (){
    try {
        info("init log")
        module.exports.info = info
        module.exports.err = err
    } catch (e) {
        err(e)
    }
}
function info(i1,i2,i3,i4,i5) {
    writeLog("mlog info",getMsg(i1)+","+  getMsg(i2)+","+  getMsg(i3)+","+  getMsg(i4)+","+  getMsg(i5))
    showToast("mlog info:"+  getMsg(i1)+","+  getMsg(i2)+","+  getMsg(i3)+","+  getMsg(i4)+","+  getMsg(i5))
}
function err(e1, e2, e3, e4, e5) {
    writeLog("mlog err",getMsg(e1)+","+getMsg(e2)+","+getMsg(e3)+","+ getMsg(e4)+","+ getMsg(e5))
    showModal("mlog err:",getMsg(e1)+","+getMsg(e2)+","+getMsg(e3)+","+ getMsg(e4)+","+ getMsg(e5))
}
function getMsg(e) {
    try {
        if (e == null) {
            return ""
        } else if (e instanceof TypeError||e.stack!=null) {
            return e.stack
        } else if (e instanceof Error||e.errMsg!=null||e.message!=null) {//yun err
            return e.errMsg||e.message
        }else {
            return e
        }
    } catch (e1) {
        console.error("getMsg is err",e1)
    }
}
function showToast(title,icon,duration){
    wx.showModal({
        title:title,
        icon:icon!=null?icon:"loading",
        duration:duration>0?duration:2000
    })
}
function showModal(title,content, ocallback, ccallback) {
    //ok,cancel
    wx.showModal({
        // title: conter,//titile 无换行
        content:content,
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
                err(e)
            }
        }
    })
}
function writeLog(title,conter){
    const tdate=new Date().toJSON()

    mfile.writeFile("mlog/"+tdate.split(" ")[0]+".mlog",
        tdate+" "+title+":\r\n"+conter+"\r\n", true,null,true)
}
module.showToast=showToast
module.showModal=showModal
