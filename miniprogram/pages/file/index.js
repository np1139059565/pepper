//index.js
const app = getApp()

Page({
    data: {
        editor: {
            ctx: null,
            file_name: ""
        },
        tree: {
            path: "",
            child_arr: []//[{text,evData}]
        }
    },
    onLoad: function () {
        try {
            //init editor
            if (this.data.editor.ctx == null) {
                this.data.editor.ctx = wx.createSelectorQuery().select("#i-editor").context((ccr) => {
                    this.data.editor.ctx = ccr.context
                    this.setData(this.data)
                }).exec()
            }
            //init tree
            const absolute_path = app.data.wx_file.f_static_get_absolute_path()
            this.data.tree.path = absolute_path.substr(0, absolute_path.length - 1)
            this.f_refush_child()
        } catch (e) {
            app.f_errrr(e)
        } finally {
            this.setData(this.data)
        }
    },

    f_refush_child: function (isClearEdit = false) {
        try {
            //refush child
            this.data.tree.child_arr = app.data.wx_file.f_static_readdir(this.data.tree.path).map(dirName => {
                var msg = "permission"
                const stat = app.data.wx_file.f_static_getstat(this.data.tree.path + "/" + dirName)
                if (stat != null) {
                    if (stat.isDirectory()) {
                        msg = "d"
                    } else {
                        msg = "f:" + stat.size
                    }
                }
                return { text: dirName + ":" + msg, evData: dirName }
            })
            //add ".." child
            this.data.tree.child_arr.splice(0, 0, { text: "..", evData: ".." })

            if (isClearEdit) {
                //clear editor
                this.data.editor.file_name = ""
                this.data.editor.ctx.clear()
            }
        } catch (e) {
            app.f_err(e)
            app.data.module_log.f_static_show_toast("打开目录失败！")
        } finally {
            this.setData(this.data)
            app.f_info("refush child", this.data.tree.path)
        }
    },
    f_open_file: function (file_name) {
        try {
            this.data.editor.file_name = file_name
            this.data.editor.ctx.clear()
            this.data.editor.ctx.insertText({ text: app.data.wx_file.f_static_readfile(this.data.tree.path + "/" + file_name) })
        } catch (e) {
            app.f_err(e)
            app.data.module_log.f_static_show_toast("打开文件失败！")
        } finally {
            this.setData(this.data)
            app.f_info("open file", this.data.tree.path, this.data.editor.file_name)
        }
    },
    f_save_file: function () {
        app.data.module_log.f_wx_static_show_modal("保存?", () => {
            this.data.editor.ctx.getContents({
                success: res => {
                    try {
                        app.data.module_log.f_static_show_toast("保存结果："
                            + app.data.wx_file.f_static_writefile(this.data.tree.path + "/" + this.data.editor.file_name, res.text))
                        this.f_refush_child()
                    } catch (e) {
                        app.f_err(e)
                        app.data.module_log.f_static_show_toast("保存失败！")
                    }
                }
            })
        }, () => { })
    },

    f_click: function (e) {
        try {
            const child_name = e.currentTarget.dataset.event1Data1
            switch (child_name) {
                case "..":
                    // back...
                    if (false == (this.data.tree.path + "/").endsWith(app.data.wx_file.f_static_get_absolute_path())) {
                        this.data.tree.path = this.data.tree.path.substr(0, this.data.tree.path.lastIndexOf("/"))
                        this.setData(this.data)
                        this.f_refush_child(true)
                    } else {
                        app.data.module_log.f_static_show_toast("已经到根目录了！")
                    }
                    break;
                default:
                    const child_path = this.data.tree.path + "/" + child_name
                    const stat = app.data.wx_file.f_static_getstat(child_path)
                    if (stat != null) {
                        //next
                        if (stat.isDirectory()) {
                            this.data.tree.path = child_path
                            this.setData(this.data)
                            this.f_refush_child(true)
                        } else if (this.data.editor.file_name == "")
                            this.f_open_file(child_name)
                        else app.data.module_log.f_static_show_modal({
                            content: "正在编辑,是否放弃修改？",
                            showCancel: true,
                            success: () => {
                                this.f_open_file(child_name)
                            }
                        })
                    } else {
                        this.f_refush_child()
                    }
                    break;
            }
        } catch (e1) {
            app.f_err(e1)
            app.data.module_log.f_static_show_toast("操作失败！")
        }
    },
    f_show_menus: function (e) {
        try {
            const itemList = []
            const child_name = e.currentTarget.dataset.event1Data1
            const childPath = this.data.tree.path + "/" + child_name
            const stat = app.data.wx_file.f_static_getstat(childPath)
            if (stat != null) {
                itemList.push("DELETE")
                if (stat.isDirectory()) {
                    itemList.push("NEXT")
                } else {
                    itemList.push("OPEN")
                    if (child_name == this.data.editor.file_name) {
                        itemList.push("SAVE")
                    }
                }
            }
            app.data.module_log.f_wx_static_show_sheet({
                itemList: itemList,
                fail:(e)=>{
                    app.f_err(e)
                    app.data.module_log.f_static_show_toast("操作失败！")
                },
                success: (sindex) => {
                    try {
                        const sval=itemList[sindex]
                        switch (sval) {
                            case "DELETE":
                                app.data.module_log.f_wx_static_show_modal("确定删除 " + child_name + "?", () => {
                                    app.data.module_log.f_static_show_toast("del is " + app.data.wx_file.f_static_rmpath(childPath))
                                    this.f_refush_child(true)
                                }, () => {
                                })
                                break;
                            case "SAVE":
                                this.f_save_file()
                                break;
                            case "NEXT":
                                this.data.tree.path = childPath
                                this.setData(this.data)
                                this.f_refush_child(true)
                                break;
                            case "OPEN":
                                if (stat.size > 1024) {
                                    app.data.module_log.f_wx_static_show_modal("文件过大，任然打开?", () => {
                                        this.f_open_file(child_name)
                                    }, () => {
                                    })
                                } else {
                                    this.f_open_file(child_name)
                                }
                                break;

                        }
                    } catch (e1) {
                        app.f_err(e1)
                        app.data.module_log.f_static_show_toast("操作失败！")
                    }
                }
            })
        } catch (e1) {
            app.f_err(e1)
            app.data.module_log.f_static_show_toast("操作失败！")
        }
    },
    f_create_new_file: function (e) {
        try {
            this.data.editor.ctx.getContents({
                success: res => {
                    try {
                        const fileName = res.text.split("\n")[0].trim()
                        if (fileName != "") {
                            app.data.module_log.f_wx_static_show_modal("create new file:" + fileName + "?", () => {
                                try {
                                    app.data.module_log.f_static_show_toast("保存结果："
                                        + app.data.wx_file.f_static_writefile(this.data.tree.path + "/" + fileName, res.text))
                                    this.f_refush_child()
                                } catch (e1) {
                                    app.f_err(e1)
                                }
                            }, () => { })
                        }
                    } catch (e1) {
                        app.f_err(e1)
                    }
                }
            })
        } catch (e1) {
            app.f_err(e1)
            app.data.module_log.f_static_show_toast("操作失败！")
        }
    }
})