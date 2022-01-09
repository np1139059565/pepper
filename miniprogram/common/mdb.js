const LOCAL_DB_PATH="db_pepper/"
const TABLE_NAME={
    KEY_LIST:"tb_key",
    COUNT_DAY:"tb_count_d"
}
var mlog = require("mlog.js"),myun=null,mfile=null

/**
 *
 * @param i1
 * @param i2
 * @param i3
 * @param i4
 * @param isLog 防止造成死循环
 */
function info(i1,i2,i3,i4,isLog=false) {
    try {
        if (mlog.info == null||isLog) {
            console.info("mdb",i1,i2,i3,i4)
            mlog.static_showToast("mdb:"+mlog.static_getMsg(i1,i2,i3,i4))
        } else {
            mlog.info("mdb", i1, i2, i3, i4)
        }
    } catch (e) {
        console.error("mdb",e)
        mlog.static_showModal("mdb:"+mlog.static_getMsg(e))
    }
}

function err(e1, e2, e3,e4,isLog=false) {
    try {
        if (mlog.err == null||isLog) {
            console.error("mdb",e1, e2, e3,e4)
            mlog.static_showModal("mdb:"+mlog.static_getMsg(e1, e2, e3,e4))
        } else mlog.err("mdb", e1,e2,e3,e4)
    } catch (e) {
        console.error("mdb",e)
        mlog.static_showModal("mdb:"+mlog.static_getMsg(e))
    }
}

module.exports.static_init = (c_mlog,c_myun,c_mfile,callback) => {
    try {
        if (c_mlog != null) {
            mlog = c_mlog
        }
        info("init mdb...")

        if (c_myun != null) {
            myun = c_myun
        }
        if (c_mfile != null) {
            mfile = c_mfile
        }
        //refush local db
        if(false==mfile.static_isDir(mfile.getUserDir()+LOCAL_DB_PATH)){
            info("init local table..")
            initLocalTable(callback)
        }
        module.exports.query=queryLocal
    } catch (e) {
        err(e)
    }
}
module.exports.TABLE_NAME=()=>{
    return TABLE_NAME
}

function initLocalTable(callback){
    var count=0
    Object.values(TABLE_NAME).map(tableName=>{
        count+=1//count++
        queryYunTable(tableName,(code,r)=>{
            //write local table
            mfile.static_writeFile(LOCAL_DB_PATH+tableName,JSON.stringify(r))
            //check is end
            count-=1
            if(count<=0&&typeof callback=="function"){
                callback()
            }
        })
    })
}
function queryLocal(tableName){
    return mfile.static_readFile(LOCAL_DB_PATH+tableName)
}
function queryYunTable(tableName,callback){
    try{
        info("query",tableName)
        myun.runEventSync("yun_hand_db",{
            geo:{"where":{"_id":tableName}},
            queryType:"get"},(code,r)=>{
            //database res
            if(code){
                if(null!=r.result.code&&!r.result.code){
                    code=false
                    err(r.result.errMsg)
                }else if(r.result.data.length==0){
                    code=false
                    err("not find table",tableName)
                }else{
                    r=r.result.data[0].conter
                }
            }
            callback(code,r)
        })
    }catch (e){
        err(e)
    }
}


