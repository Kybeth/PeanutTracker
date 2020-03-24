/** 获取某日期打卡情况 */
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
  const res = await db.collection('checkin')
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
    _id: '$type',
    typeSum: $.sum('$num'),
  })
  .group({
    _id: null,
    types: $.push('$_id'),
    dailySum: $.sum('$typeSum')
  })
  .end()

  console.log("查询结果", res.list)

  let types = []
  let dailySum = 0
  if (res.list.length > 0) {
    dailySum = res.list[0].dailySum 
    types = res.list[0].types
  }
  console.log("dailySum:", dailySum, "types:",types)
  return {
    types: types,
    num: dailySum
  }
}