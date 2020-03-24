//index.js
//获取应用实例
const app = getApp()
const util = require('../../utils/util.js')
const db = wx.cloud.database()
const userDB = db.collection("users")
const checkinDB = db.collection("checkin")

Page({
  data: {

    error: false,

    index: 0,
    typeArray: ['做题', '讲题', '其他'],    
    placeholderArray: ["eg. lc1 Two Sum, lc200 Number of Islands (题目之间请用英文,分隔)", "eg. 今天给大家讲了lc1和Java的garbage collection", "今天做了亚麻oa/今天学了九章ood/今天准备了5个bq故事"],
    placeholder: "eg. lc1 Two Sum, lc200 Number of Islands (题目之间请用英文,分隔)",

    tda: null,
    formattedDate: null,
    recordType: "",
    submitSuccess: false,
    submitLoading: false,
    input: null,
    numToday: 0,

    list: [{
      "text": "打卡",
      "iconPath": "/static/icons/edit_black.png",
      "selectedIconPath": "/static/icons/edit_green.png"
  },
  {
      "text": "记录",
      "iconPath": "/static/icons/user_black.png",
      "selectedIconPath": "/static/icons/user_green.png",
  }],

    searchLoading: false,
    probNum: '',
    probName: ''

  },

  // 点击tabbar的动作
  tabChange(e) {
    console.log('tab change', e)
    wx.redirectTo({
      url: '/pages/personalRecords/personalRecords'
    })
  },

  // 我的search 行为
  bindKeyInput(e) {
    console.log('input: ', e)
    this.setData({
      probNum: e.detail.value,
      
    })
  },
  searchLC(e) {
    console.log('点击了search: ', this.data.probNum)
    this.setData({
      probName: '',
      searchLoading: true
    })
    let that = this
    // 查询leetcode题库
    wx.cloud.callFunction({
      name: "getLC",
      data: {
        num: parseInt(this.data.probNum)
      },
      success(res) {
        console.log("通过云函数获取leetcode成功：", res.result)
        that.setData({
          probName: res.result,
          searchLoading: false
        })
      },
      fail(res) {
        console.log("通过云函数获取leetcode失败")
      }
    })
  },

  // 点击搜索出的题目后打卡
  checkinAProbC(e) {
    console.log('点击了题目: ', this.data.probNum)
    //打卡
  },


  onLoad: function () {
    wx.stopPullDownRefresh() //刷新完成后停止下拉刷新动效

    // 获取当前打卡日
    if (app.globalData.checkinDate) {
      console.log('app date出来了：', app.globalData.checkinDate)
      this.setData({
        tda: app.globalData.checkinDate,
        formattedDate: util.formatTime(app.globalData.checkinDate)
        
      })
    } else {
      // app date没出来的情况
      let mydate = new Date()
      let localTime = mydate.getTime()
      let localOffset = mydate.getTimezoneOffset() * 60000;
      let utc = localTime + localOffset
      let dakaOffset = (-10) * 60 * 60000
      let daka = utc + dakaOffset
      let dakaDate = new Date(daka)
      this.setData({
        tda: dakaDate,
        formattedDate: util.formatTime(dakaDate)
      })
    }

  },


  onPullDownRefresh() {
    //this.onLoad(); //重新加载onLoad()
    app.onLaunch()
  },

  // 选择打卡类型
  bindPickerChange: function (e) {
    console.log('picker选择改变')
    this.setData({
      index: e.detail.value,
      placeholder: this.data.placeholderArray[e.detail.value],
      submitSuccess: false
    })
  },

  /* 提交表单 */
  formSubmit: function (e) {
    console.log('form发生了submit事件')
    
    if (e.detail.value.picker == 0) 
      this.setData({
        numToday: e.detail.value.input.split(",").length
      })

    /* 更新checkinDB */
    // 目前未对打卡进行限制，所有人都能打卡
    console.log('存入数据库前：', this.data.tda)
    this.setData({
      submitLoading: true
    })
    checkinDB.add({
      data: {
        createTime: db.serverDate(),
        checkinDate: {
          year: this.data.tda.getFullYear(),
          month: this.data.tda.getMonth(),
          date: this.data.tda.getDate(),
          full: this.data.tda
        },
        type: this.data.typeArray[e.detail.value.picker],
        num: this.data.numToday,
        content: e.detail.value.input
      },
    })
    .then(res => {
      console.log("checkinDB add success", res)
      this.setData({
        submitLoading: false,
        submitSuccess: true
      })
    })
    .catch(console.error)

  }, // end of formSubmit

  // 选择reset
  formReset: function () {
    console.log('form发生了reset事件')
    this.setData({
      index: 0,
      placeholder: this.data.placeholderArray[0],
      submitSuccess: false,
      numToday: 0
    })
  },
})