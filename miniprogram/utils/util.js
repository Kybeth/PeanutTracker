const formatTime = mydate => {
  
  const year = mydate.getFullYear()
  const month = mydate.getMonth() + 1
  const date = mydate.getDate()
  const dayth = mydate.getDay()
  const dayList = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat']
  const day = dayList[dayth]
  //const hour = date.getHours()
  //const minute = date.getMinutes()
  //const second = date.getSeconds()

  return month + '/' + date + '/' + year + ' ' + day
}

const ndate = (oriDate, n) => {
  return new Date(oriDate.setDate(oriDate.getDate() + n))
}

module.exports = {
  formatTime: formatTime,
  getDate: ndate
}
