//index.js
//获取应用实例
const app = getApp()
const util = require('../../utils/util.js')
const db = wx.cloud.database()
const userDB = db.collection("users")
const checkinDB = db.collection("checkin")

Page({
  data: {

    msg: '',

    pickerIndex: 0,
    typeArray: ['做题', '讲题', '其他'],    
    placeholderArray: ["eg. lc1 Two Sum, lc200 Number of Islands (题目之间请用英文,分隔)", "eg. 今天给大家讲了lc1和Java的garbage collection", "今天做了亚麻oa/今天学了九章ood/今天准备了5个bq故事"],
    placeholder: "eg. lc1 Two Sum, lc200 Number of Islands (题目之间请用英文,分隔)",

    tda: null,
    formattedDate: null,
    recordType: "",
    submitSuccess: false,
    submitLoading: false,
    input: null,
    

    // Search 
    searching: false,
    probNum: '',
    probName: '',
    numSubmit: 0, //need a new way to count!!
    probsToday: [],
    probConfirmed: false,

    // UI 相关
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
    slideButtons: [{
      type: 'warn',
      text: '删除',
      src: '/static/icons/trash.png', // icon的路径
    }],
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
    console.log('seachBar input: ', e)
    this.setData({
      probNum: e.detail.value,
    })
  },
  searchLC(e) {
    console.log('点击了search: ', this.data.probNum)
    this.setData({
      probName: '',
      searching: true
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
          searching: false
        })
      },
      fail(res) {
        console.log("通过云函数获取leetcode失败")
      }
    })
  },

  // 点击搜索出的题目后，移动入待提交区
  confirmProb(e) {
    console.log('点击了题目: ', this.data.probNum)
    let probsArr = this.data.probsToday
    probsArr.push(this.data.probName)
    this.setData({
      probsToday: probsArr
    })
    console.log('probToday: ', this.data.probsToday)
    this.setData({
      probName: ''
    })
  },

  // 点击滑动标签
  slideButtonTap(e) {
    console.log('slide button tap', e.detail)
    this.setData({
      probName: ''
    })
},

  // textarea里进行输入
  bindTextarea(e) {
    console.log('Textarea: ', e.detail.value)
    this.setData({
      input: e.detail.value
    })
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
      pickerIndex: e.detail.value,
      placeholder: this.data.placeholderArray[e.detail.value],
      submitSuccess: false
    })
  },

  /* 提交表单 */
  formSubmit: function (e) {
    console.log('form发生了submit事件')
    let num = 0
    let content = ''
    if (this.data.pickerIndex == 0) {
      num = this.data.probsToday.length
      content = this.data.probsToday; //e.detail.value.input
    } else {
      content = this.data.input
    }

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
        type: this.data.typeArray[this.data.pickerIndex],
        num: num,
        content: content
      },
    })
    .then(res => {
      console.log("checkinDB add success", res)
      this.setData({
        submitLoading: false,
        submitSuccess: true,
        numSubmit: num
      })
    })
    .catch(console.error)

  }, // end of formSubmit

  onShareAppMessage: function () {
    // return custom share data when user share.
    return {
      title: '今 天 你 打 卡 了 吗',
      path: 'pages/createRecords/createRecords',
      imageUrl: '/static/pics/peanut5_4.jpeg'
    }
  },
})