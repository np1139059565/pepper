var mlog = require("mlog.js"),myun=null

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

module.exports.static_init = (c_mlog,c_myun) => {
    try {
        if (c_mlog != null) {
            mlog = c_mlog
        }
        info("init mdb...")

        if (c_myun != null) {
            myun = c_myun
            module.exports.querySync=query
        }
    } catch (e) {
        err(e)
    }
}
module.exports.DB_TABLE_NAME=()=>{
    return DB_TABLE_NAME
}
const DB_TABLE_NAME={
    KEY_LIST:"tb_key",
    COUNT_DAY:"tb_count_d"
}
const DB_GEO_TYPE={
    WHERE:"where"
}
const DB_QUERY_TYPE={
    GET:"get"
}
function query(tableName,callback){
    try{
        info("query",tableName)
        myun.runEventSync("yun_hand_db",{
            geo:{[DB_GEO_TYPE.WHERE]:{_id:tableName}},
            queryType:DB_QUERY_TYPE.GET},(code,r)=>{
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


