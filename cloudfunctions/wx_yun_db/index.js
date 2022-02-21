// 部署：在 cloud-functions/database 文件夹右击选择 “上传并部署-云端安装依赖”
// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV//yfwq1-4nvjm;不写则使用默认云
})


/**
 * 云函数入口函数
 * @param params {database,querytype,geo,data}
 * @param context
 * @returns {Promise<*>}
 */
exports.main = async(params, context) => {//查数据库只能使用异步接口
    try {
        const table=f_get_table(params)
        if(typeof table=="string"){
            return {code:false,errMsg:table}
        } else return f_table_hand(table,params)
    } catch (e) {
        return {code: false, errMsg: e.stack}
    }
}

/**
 * 
 * @param {*} params:
 *              geo:{where,limit,orderBy,skip,field,doc} field不能使用多层{}；并且true和false不能混着用，必须是清一色
 * @returns 
 */
function f_get_table(params){
    try{
        var hand=""
        for (var h in geo) {
            //前端只支持doc.update,服务端还支持where.update//cloud.database().collection('kiwi').doc(id)
            switch (h) {
                case "where":
                    hand+="['where']("+JSON.stringify(params.geo[h])+")"//{where:{_id}}
                    break;
                case "limit":
                    hand+="['limit']("+(geo[h] >= 0 ? params.geo[h] : 1)+")"//default 1 {limit:1}
                    break;
                case "orderBy":
                    hand+="['orderBy']("+geo[h].cel+","+params.geo[h].order+")"//排序{orderBy:{cel:1,order:2}}
                    break;
                case "skip":
                    hand+="['skip']("+(geo[h] >= 0 ? params.geo[h] : 0)+")"//default 0
                    break;
                case "field":
                    var bool=null
                    if(Object.keys(params.geo.field).filter(k=>{
                        const kbool=params.geo.field[k]
                        if(bool==null){
                            bool=kbool
                            return true
                        }else return bool==kbool
                    }).length==Object.keys(params.geo.field).length){
                        hand+="['field']("+JSON.stringify(params.geo[h])+")"//过滤{field:{settings:true,times:false}}
                    }else throw new TypeError("field is check fail.")
                    break;
                case "doc":
                    hand+="['doc']("+params.geo[h]+")"//document
                    break;
                default:
                    return ("is not find geo:" + h)
            }
        }
        return eval("cloud.database().collection('"+params.database+"')"+hand)
    }catch (e){
        return "get table is err:"+e.stack
    }
}

/**
 * 
 * @param {*} table 
 * @param {*} params {updateGeo}
 * @returns 
 */
function f_table_hand(table,params){
    try{
        var qtype=params.querytype
        switch (qtype) {
            // case "del":
            //   return collecton.remove()
            //   break;
            case "update":
                return table.update({data: params.data})//只能更新object,arr是直接覆盖的
                break;
            case "updatetable":
                return f_update_table(params)
                break;
            case "get":
                return table.get()//{code,data,errMsg}
                break;
            default:
                return {code: false, errMsg:"is not find queryType:" + qtype}
        }
    }catch (e){
        return {code:false,errMsg:"get promise is err:"+e.stack}
    }
}
/**
 *
 * @param params {geo:{where:{_id}},newTable:{_id}}
 * @returns {*}
 */
async function f_update_table(params) {
    //remove old table by geo.where
    await cloud.database().collection(params.database).where(params.geo.where).remove()
    //save new table
    return await cloud.database().collection(params.database).add({data:params.data})
}