/** 获取某人某月打卡情况 */
// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({env: "peanut-tracker-5or3q"})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  const _ = db.command
  const $ = _.aggregate
  const res = await db.collection('checkin')
  .aggregate()
  .match(
    $.and([
      {'_openid': wxContext.OPENID}, 
      {'checkinDate.year': event.year},
      {'checkinDate.month': event.month}
    ])
  )
  .group({
    _id: '$checkinDate.date',
    dailySum: $.sum('$num')
  })
  .group({
    _id: null,
    CountOfCheckinDays: $.sum(1),
    monthlySum: $.sum('$dailySum'),
  })
  .end()
  console.log("查询结果", res.list)
  let CountOfCheckinDays = 0
  let monthlySum = 0
  if (res.list.length > 0) {
    CountOfCheckinDays = res.list[0].CountOfCheckinDays
    monthlySum = res.list[0].monthlySum
  }
  return {
    CountOfCheckinDays: CountOfCheckinDays,
    monthlySum: monthlySum
   }
}