//app.js

App({
  onLaunch: function (options) {
    // 云开发初始化
    wx.cloud.init({
      env: "peanut-tracker-5or3q"
    })
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    

    /* 通过云函数获取用户openid */
    let that = this
    wx.cloud.callFunction({
      name: "getOpenid",
      success(res) {
        console.log("app.js通过云函数获取用户id成功")
        that.globalData.openid = res.result.openid 
      },
      fail(res) {
        console.log("app.js通过云函数获取用户id失败")
      }
    })

    /* 获取打卡日 */
    // 1. get msec since Jan 1 1970
    let mydate = new Date()
    let localTime = mydate.getTime()
    // 2. obtain local UTC offset and convert to msec
    let localOffset = mydate.getTimezoneOffset() * 60000;
    // 3. obtain UTC time in msec
    let utc = localTime + localOffset

    /* 4. est offset
    let estOffset = (-5) * 60 * 60000
    let est = utc + estOffset
    // 5. est to human readable string
    let estDate = new Date(est) */

    // 4.1 打卡日是美东6am，刚好等于GMT-10
    let dakaOffset = (-10) * 60 * 60000
    let daka = utc + dakaOffset
    let dakaDate = new Date(daka)
    console.log('打卡日:', dakaDate)

    
    
    
    /* 5.1 打卡日 to human readable string
    let ndate = dakaDate.toDateString()
    let dateStrArr = ndate.split(' ')
    let fullDate = {
      year: dakaDate.getFullYear(),
      month: dakaDate.getMonth(),
      date: dakaDate.getDate(),// !!!
      day: dakaDate.getDay(),
      time: dakaDate.getHours()
    } */
    this.globalData.checkinDate = dakaDate
  },

  onShow(options) {},
    
  globalData: {
    userInfo: null,
    openid: null,
    checkinDate: null,
    checkinDateOri: null
  }
})