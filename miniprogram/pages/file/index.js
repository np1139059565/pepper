//index.js
const app = getApp()

Page({
    data: {
        editor: {
            ctx: null,
            file_name:""
        },
        tree:{
            path:"",
            child_arr:[]//[{text,evData}]
        }
    },
    onLoad:function() {
        try {
            //init editor
            if (this.data.editor.ctx == null) {
                this.data.editor.ctx = wx.createSelectorQuery().select("#i-editor").context((ccr) => {
                    this.data.editor.ctx = ccr.context
                    this.setData(this.data)
                }).exec()
            }
            //refush tree
            this.f_refush_child()
        } catch (e) {
            app.data.c_mlog.f_static_err(e)
        }
    },

    f_refush_child: function (isClearEdit=false) {
        try {
            //init path
            if(this.data.tree.path==""){
                this.data.tree.path = app.data.wx_file.f_static_get_absolute_path()
                 app.data.wx_file.f_static_mkdir(this.data.tree.path)
            }

            //refush child
            this.data.tree.child_arr = app.data.wx_file.f_static_readdir(this.data.tree.path).map(dirName => {
                var msg = "permission"
                const stat = app.data.wx_file.f_static_getstat(this.data.tree.path + dirName)
                if (stat != null) {
                    if (stat.isDirectory()) {
                        msg = "d"
                    } else {
                        msg = "f:" + stat.size
                    }
                }
                return {text: dirName + ":" + msg, evData: dirName}
            })
            //add ".." child
            this.data.tree.child_arr.splice(0, 0, {text: "..", evData: ".."})

            if(isClearEdit){
                //clear editor
                this.data.editor.file_name=""
                this.data.editor.ctx.clear()
            }
        } catch (e1) {
            app.data.c_mlog.f_static_err(e1)
        }finally {
            this.setData(this.data)
            app.data.c_mlog.f_static_info("refush child", this.data.tree.path)
        }
    },
    f_open_file: function (fileName) {
        try {
            this.data.editor.file_name=fileName
            this.data.editor.ctx.clear()
            this.data.editor.ctx.insertText({text:app.data.wx_file.f_static_readfile(this.data.tree.path + fileName)})
        } catch (e1) {
            app.data.c_mlog.f_static_err(e1)
        }finally {
            this.setData(this.data)
            app.data.c_mlog.f_static_info("open file",this.data.tree.path,this.data.editor.file_name)
        }
    },
    f_save_file: function () {
        try {
            app.data.c_mlog.f_wx_static_show_modal("保存?",() => {
                this.data.editor.ctx.getContents({
                    success:res=>{
                        try{
                            app.data.c_mlog.f_wx_static_show_toast("保存结果："
                                + app.data.wx_file.f_static_writefile(this.data.tree.path+this.data.editor.file_name, res.text))
                            this.f_refush_child()
                        }catch (e){
                            app.data.c_mlog.f_static_err(e)
                        }
                    }
                })
            }, () => {})
        } catch (e) {
            app.data.c_mlog.f_static_err(e)
        }
    },

    f_next: function (e) {
        try {
            const childName = e.currentTarget.dataset.event1Data1
            switch (childName) {
                case "..":
                    // back...
                    const backPath=this.data.tree.path.substr(0,
                        this.data.tree.path.substr(0,this.data.tree.path.length-1).lastIndexOf("/"))+"/"
                    if (false==app.data.wx_file.f_static_get_absolute_path().endsWith(backPath)) {
                        this.data.tree.path = backPath
                        this.setData(this.data)
                        this.f_refush_child(true)
                    } else {
                        app.data.c_mlog.f_static_err("is root dir",backPath)
                    }
                    break;
                default:
                    // next
                    const childPath = this.data.tree.path + childName
                    const stat = app.data.wx_file.f_static_getstat(childPath)
                    if(stat!=null&&stat.isDirectory()){
                        this.data.tree.path = childPath + "/"
                        this.setData(this.data)
                        this.f_refush_child(true)
                    }else{
                        this.f_refush_child()
                    }
                    break;
            }
        } catch (e1) {
            app.data.c_mlog.f_static_err(e1)
        }
    },
    f_show_menus: function (e) {
        try {
            const sheet=[]
            const childName=e.currentTarget.dataset.event1Data1
            const childPath=this.data.tree.path+childName
            const stat=app.data.wx_file.f_static_getstat(childPath)
            if(stat!=null){
                sheet.push("DELETE")
                if(stat.isDirectory()){
                    sheet.push("NEXT")
                }else{
                    sheet.push("OPEN")
                    if(childName==this.data.editor.file_name){
                        sheet.push("SAVE")
                    }
                }
            }
            app.data.c_mlog.f_wx_static_show_sheet(sheet,(sval,sindex)=>{
                try{
                    switch (sval){
                        case "DELETE":
                            app.data.c_mlog.f_wx_static_show_modal("确定删除 " + childName + "?", () => {
                                app.data.c_mlog.f_wx_static_show_toast("del is "+app.data.wx_file.f_static_rmpath(childPath))
                                this.f_refush_child(true)
                            }, () => {
                            })
                            break;
                        case "SAVE":
                            this.f_save_file()
                            break;
                        case "NEXT":
                            this.data.tree.path = childPath+"/"
                            this.setData(this.data)
                            this.f_refush_child(true)
                            break;
                        case "OPEN":
                            if (stat.size > 1024) {
                                app.data.c_mlog.f_wx_static_show_modal("文件过大，任然打开?", () => {
                                    this.f_open_file(childName)
                                }, () => {
                                })
                            } else {
                                this.f_open_file(childName)
                            }
                            break;

                    }
                }catch (e1){
                    app.data.c_mlog.f_static_err(e1)
                }
            },()=>{})


        } catch (e1) {
            app.data.c_mlog.f_static_err(e1)
        }
    },
    f_edit_to_new_file:function (e){
        try{
            this.data.editor.ctx.getContents({
                success:res=>{
                    try{
                        const fileName=res.text.split("\n")[0].trim()
                        if(fileName!=""){
                            app.data.c_mlog.f_wx_static_show_modal("create new file:"+fileName+"?",()=>{
                                try{
                                    app.data.c_mlog.f_wx_static_show_toast("保存结果："
                                        + app.data.wx_file.f_static_writefile(this.data.tree.path+fileName, res.text))
                                    this.f_refush_child()
                                }catch (e1){
                                    app.data.c_mlog.f_static_err(e1)
                                }
                            },()=>{})
                        }
                    }catch (e1){
                        app.data.c_mlog.f_static_err(e1)
                    }
                }
            })
        }catch (e1) {
            app.data.c_mlog.f_static_err(e1)
        }
    }
})