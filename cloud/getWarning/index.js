// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: "peanut-tracker-5or3q"})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  // openid: wxContext.OPENID,
  const db = cloud.database()
  const _ = db.command
  const $ = _.aggregate
  const res = db.collection('checkin')
  .aggregate()
  .match(
    $.and([
      {'_openid': wxContext.OPENID}, 
      {'checkinDate.year': event.year},
      {'checkinDate.month': event.month},
      {'checkinDate.date': event.date}
    ])
  )
  .group({
    _id: null,
    dailySum: $.sum('$num')
  })
  .end()
  return res == 0
}