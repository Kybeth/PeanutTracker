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

    numSubmit: 0, //need a new way to count!!
    probList: [], // id:1; name: lc1 2sum; difficulty: easy;
    probConfirmed: false,
    manualInputPrompt: false,
    manualInput: false,
    manualProbs: "",

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

  // 搜索框search 行为
  bindKeyInput(e) {
    console.log('seachBar input: ', e)
    this.setData({
      probNum: e.detail.value,
    })
  },
  // 搜索结果放入probList里，在toBeSubmitted区域显示出来
  searchLC(e) {
    console.log('点击了search，搜索这个题号: ', this.data.probNum)
    this.setData({

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
        if (res.result == "not exist!") {
          console.log("该题目数据库里没有")
          that.setData({
            searching: false,
            manualInputPrompt: true
          })
        } else {
          // add a new item to list
          let len = that.data.probList.length
          that.data.probList = [{id: '_' + len, name: res.result}].concat(that.data.probList)
          that.setData({
            searching: false,
            probList: that.data.probList
          })
        }
        
      },
      fail(res) {
        console.log("通过云函数获取leetcode失败", res)
      }
    })
  },
  // 显示手动输入框
  getManualInputBox(e) {
    this.setData({
      manualInputPrompt: false,
      manualInput: true,
    })
  },
  // 手输过程
  bindTextarea1(e) {
    console.log('seachBar input: ', e)
    this.setData({
      manualProbs: e.detail.value,
    })
  },
  // 手输完成,parse题目
  parseManualInput(e) {
    let manualArr = this.data.manualProbs.split(',')

    // add a new item to list
    manualArr.forEach(prob => {
      let len = this.data.probList.length
      this.data.probList = [{id: '_' + len, name: prob}].concat(this.data.probList)
    })
    this.setData({
      manualInput: false,
      probList: this.data.probList
    })

  },

  // 手输取消
  cancelManualInputBox(e) {
    this.setData({
      manualInput: false,
    })
  },

  // 不显示手动输入框，回到默认状态
  backToAutoInput(e) {
    this.setData({
      manualInputPrompt: false,
    })
  },

  // 点击“删除”
  deleteItem(e) {
    console.log('点击了删除键',e)
    //let probList = this.data.probList
    let id = e.currentTarget.id
    let probList = this.data.probList.filter(item => item.id != id)
    // probList.splice(probId, 1)
    this.setData({
      probList
    })
    console.log("删除了之后list现为：", this.data.probList)

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
      num = this.data.probList.length
      content = this.data.probList.map(item => item.name)
    } else {
      content = this.data.input
    }
    console.log("即将提交入数据库的内容：", content)

    /* 更新checkinDB */
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