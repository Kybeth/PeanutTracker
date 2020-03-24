// miniprogram/pages/login.js
Page({
  data: {
    userInfo: {},
    hasUserInfo: false
  },

  getUserInfo: function (e) {
    let that = this;
    // 获取用户信息
    wx.getSetting({
      success(res) {
        // console.log("res", res)
        if (res.authSetting['scope.userInfo']) {
          console.log("已授权=====")
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success(res) {
              console.log("获取用户信息成功", res)
              that.setData({
                name: res.userInfo.nickName,
                head: res.userInfo.avatarUrl
              })
              wx.reLaunch({
                url: '../index/index'
              })
            },
            fail(res) {
              console.log("获取用户信息失败", res)
            }
          })
        } else {
          console.log("未授权=====")
        }
      }
    })
  }
})