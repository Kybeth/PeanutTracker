// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({env: "peanut-tracker-5or3q"})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database() 
  const _ = db.command
  const $ = _.aggregate

  const num = event.num
  console.log(event)

  try {
    const res = await db.collection('lc_imported')
    .where({'stat.frontend_question_id': num})
    .get()

    console.log('打印出结果', res)
    let ans = ''
    if (res.data.length > 0) {
      ans = 'lc' + num + '. ' + res.data[0].stat.question__title
    } else {
      ans = 'not exist!'
    }
    return ans
  } catch (err) {
    console.log(err)
  }
}