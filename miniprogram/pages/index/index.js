// index.js
const app = getApp()

Page({
  data: {
    
  },
  onLoad:()=>{
    wx.redirectTo({
      url:"/pages/file/index.wxml"
    })
  }
});
