// pages/personalRecords.js


const app = getApp()
const util = require('../../utils/util.js')
const db = wx.cloud.database()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid: null,
    formattedDate: null,

    hasCheckinTDA: true,
    numToday: 0,
    checkinType: '',

    hasCheckinYDA: true,

    monthlySum: 0,
    CountOfCheckinDays: 0,
    hasCheckinAllMonth: false,

    list: [{
      "text": "打卡",
      "iconPath": "/static/icons/edit_black.png",
      "selectedIconPath": "/static/icons/edit_green.png"
  },
  {
      "text": "记录",
      "iconPath": "/static/icons/user_black.png",
      "selectedIconPath": "/static/icons/user_green.png",
  }]
    
  },

  tabChange(e) {
    console.log('tab change', e)
    wx.redirectTo({
      url: '/pages/createRecords/createRecords'
    })
},

  onLoad: function (options) {
    wx.stopPullDownRefresh() //刷新完成后停止下拉刷新动效
    console.log("=== 个人记录页opened ===")

    /* 获取当前打卡日期 */
    this.setData({
      formattedDate: util.formatTime(app.globalData.checkinDate)
    })

    /* 查询今日打卡 */
    const tda = app.globalData.checkinDate
    let that = this
    wx.cloud.callFunction({
      name: "getDailySum",
      data: {
        year: tda.getFullYear(),
        month: tda.getMonth(),
        date: tda.getDate()
      },
      success(res) {
        console.log("通过云函数获取TDA成功：", res)
        that.setData({
          checkinType: res.result.types,
          numToday: res.result.num
        })
        if (res.result.types.length == 0)
        that.setData({
          hasCheckinTDA: false
        })
      },
      fail(res) {
        console.log("通过云函数获取TDA失败")
      }
    })

    /* 查询昨日打卡 */
    const yda = util.getDate(new Date(tda), -1)
    wx.cloud.callFunction({
      name: "getDailySum",
      data: {
        year: yda.getFullYear(),
        month: yda.getMonth(),
        date: yda.getDate()
      },
      success(res) {
        console.log("通过云函数获取YDA成功：", res)
        if (res.result.types.length == 0)
        that.setData({
          hasCheckinYDA: false
        })
      },
      fail(res) {
        console.log("通过云函数获取YDA失败")
      }
    })

    /* 查询本月打卡情况 */
    wx.cloud.callFunction({
      name: "getNumMonth",
      data: {
        year: tda.getFullYear(),
        month: tda.getMonth(),
      },
      success(res) {
        console.log("通过云函数获取monthlyNum成功：", res)
        that.setData({
          daysMonth: res.result.CountOfCheckinDays,
          numMonth: res.result.monthlySum
        })
      },
      fail(res) {
        console.log("通过云函数获取YDA失败")
      }
    }) 



    
  },
  onPullDownRefresh() {
    this.onLoad(); //重新加载onLoad()
  },

})