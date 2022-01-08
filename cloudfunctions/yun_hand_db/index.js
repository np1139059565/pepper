// 部署：在 cloud-functions/database 文件夹右击选择 “上传并部署-云端安装依赖”
// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV//yfwq1-4nvjm;不写则使用默认云
})
const DB_NAME="db_pepper"
/**
 * 云函数入口函数
 * @param event {geo: geo, queryType: "query"}
 * @param context
 * @returns {Promise<*>}
 */
exports.main = async(event, context) => {//查数据库只能使用异步接口
    try {
        const collecton=getCollection(event.geo)
        if(typeof collecton=="string"){
            return {code:0,errMsg:collecton}
        } else return toPromise(collecton,event)
    } catch (e) {
        return {code: 0, errMsg: e.stack}
    }
}

/**
 *
 * @param geo {where,limit,orderBy,skip,field,doc} field不能使用多层{}；并且true和false不能混着用，必须是清一色
 * @returns {string|any}
 */
function getCollection(geo){
    try{
        var hand=""
        for (var h in geo) {
            //前端只支持doc.update,服务端还支持where.update//cloud.database().collection('kiwi').doc(id)
            switch (h) {
                case "where":
                    hand+="['where']("+JSON.stringify(geo[h])+")"//{where:{_id}}
                    break;
                case "limit":
                    hand+="['limit']("+(geo[h] >= 0 ? geo[h] : 1)+")"//default 1 {limit:1}
                    break;
                case "orderBy":
                    hand+="['orderBy']("+geo[h].cel+","+geo[h].order+")"//排序{orderBy:{cel:1,order:2}}
                    break;
                case "skip":
                    hand+="['skip']("+(geo[h] >= 0 ? geo[h] : 0)+")"//default 0
                    break;
                case "field":
                    hand+="['field']("+JSON.stringify(geo[h])+")"//过滤{field:{settings:true,times:false}}
                    break;
                case "doc":
                    hand+="['doc']("+geo[h]+")"//document
                    break;
                default:
                    return ("is not find geo:" + h)
            }
        }
        return eval("cloud.database().collection('"+DB_NAME+"')"+hand)
    }catch (e){
        return "get Collection is err:"+e.stack
    }
}

/**
 *
 * @param collecton
 * @param event {dbName:"languageget",queryType: "query", geo,updateGeo}
 * @returns {{code: number, errMsg: string}|*}
 */
function toPromise(collecton,event){
    try{
        var qtype=event.queryType
        switch (qtype) {
            // case "del":
            //   return collecton.remove()
            //   break;
            case "repeattable":
                return repeatTable(event)
                break;
            case "update":
                return collecton.update({data: event.updateGeo})//只能更新object,arr是直接覆盖的
                break;
            case "get":
                return collecton.get()//不能放到{}里,必须直接get
                break;
            default:
                return {code: 0, errMsg:"is not find queryType:" + qtype}
        }
    }catch (e){
        return {code:0,errMsg:"get promise is err:"+e.stack}
    }
}
/**
 *
 * @param event {geo:{where:{_id}},newTable:{_id}}
 * @returns {*}
 */
async function repeatTable(event) {
    //remove old table
    await cloud.database().collection(DB_NAME).where(event.geo.where).remove()
    //save new table
    return await cloud.database().collection(DB_NAME).add({data:event.newTable})
}