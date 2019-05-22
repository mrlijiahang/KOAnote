const {
  query
} = require('./asyncdb')
const koa = require('koa')
var cors = require('koa2-cors');
const bodyParser = require('koa-bodyparser');
const session = require('koa-session-minimal')
const MysqlStore = require('koa-mysql-session')
const app = new koa()
app.use(bodyParser());

const Router = require('koa-router')

let home = new Router()

const sessionMysqlConfig = {
  user: 'root',
  password: '123456',
  database: 'koa_demo',
  host: 'localhost',
}
app.use(session({
  key: 'USER_SID',
  store: new MysqlStore(sessionMysqlConfig)
}))

async function selectAllData(sql1) {
  let sql = sql1
  let dataList = await query(sql)
  console.log(dataList)
  return dataList
}

async function getData() {
  let dataList = await selectAllData('SELECT * FROM userinfo')

  // console.log(dataList)
  return dataList
}
async function getData1() {
  let dataList = await selectAllData('SELECT * FROM hotmapkey WHERE longitude = 106.530635')
  // console.log(dataList)
}
async function getData2() {
  let dataList = await selectAllData('SELECT longitude FROM hotmapkey')
  // console.log(dataList)
}
async function getUser(name) {
  //查询数据库是否有帐号
  let dataList = await selectAllData(`SELECT count(1) FROM userinfo where name='${name}'`)
  const userState = dataList[0]['count(1)']
  if (!userState) {
    return '帐号或密码不正确(没帐号)'
  }
  // 查询帐号对应的密码
  let userPasswpord = await selectAllData(`select password from userinfo where name='${name}'`)
  return userPasswpord[0].password
}
async function getAddress(sizestart, sizeend) {
  let dataList = await selectAllData(`select longitude,latitude from hotmapkey where longitude>${sizestart} and longitude<${sizeend}`)
  return dataList

}
async function addUser(name, pwd) {
  let userstate = await selectAllData(`SELECT count(1) FROM userinfo where name='${name}'`)
  console.log(userstate[0])
  if (userstate[0]['count(1)'] !== 0) {
    return '改帐号已存在'
  }
  let dataList = await selectAllData(`INSERT INTO userinfo (name,password) VALUES (${name},${pwd})`)
  return dataList
}
async function updatauser(name, pwd) {
  let dataList = await selectAllData(`update userinfo set password='${pwd}' where name='${name}'`)
  return dataList.changedRows
}
let posts =
    `create table if not exists posts(
     id INT NOT NULL AUTO_INCREMENT,
     name VARCHAR(100) NOT NULL,
     title TEXT(0) NOT NULL,
     content TEXT(0) NOT NULL,
     md TEXT(0) NOT NULL,
     uid VARCHAR(40) NOT NULL,
     moment VARCHAR(100) NOT NULL,
     comments VARCHAR(200) NOT NULL DEFAULT '0',
     pv VARCHAR(40) NOT NULL DEFAULT '0',
     avator VARCHAR(100) NOT NULL,
     PRIMARY KEY ( id )
    );`

// let createTable = function (sql) {
//   return query(sql, [])
// }
selectAllData(posts)


home.post('login', async (ctx, next) => {
  // 设置跨域
  ctx.set('Access-Control-Allow-Origin', '*'),
    ctx.set('Access-Control-Allow-Methods', '*'),
    ctx.set('Access-Control-Allow-Credentials', true)
  let postdata = ctx.request.body
  console.log(ctx)
  let user = {
    name: postdata.name,
    password: postdata.password
  }
  await getUser(user.name)
  let state = false;
  let msg = ''
  let data = []
  //判断帐号密码是否相等
  if (await getUser(user.name) === user.password) {
    msg = "登录成功"
    state = true
    let session = ctx.session
    session.isLogin = true
    session.userName = user.name
    // session.userId = userResult.id
  } else {
    state = false
    msg = "登录失败"
  }
  ctx.response.body = {
    status: 200,
    msg: msg,
    success: state,
    data: data
  }
})
home.post('time', async (ctx, next) => {
  let postdata = ctx.request.body
  ctx.body = postdata
  let sizearea = {
    longitudestart: postdata.longitudestart,
    longitudeend: postdata.longitudeend
  }
  let datalist = await getAddress(sizearea.longitudestart, sizearea.longitudeend)
  console.log(ctx)
  ctx.body = {
    state: ctx.response.status,
    success: true,
    data: datalist,
  }
})
home.post('adduser', async (ctx, next) => {
  let postdata = ctx.request.body
  let user = {
    name: postdata.name,
    password: postdata.pwd
  }
  let datalist = await addUser(user.name, user.password)
  let msg = '帐号已经存在'
  if (datalist.affectedRows) {
    msg = '帐号添加成功'
  }
  console.log(ctx)
  ctx.response.body = {
    state: 200,
    msg: msg,
    success: true,
  }
})

home.post('userinfo', async (ctx, next) => {
  let postdata = ctx.request.body
  console.log(ctx.request)
  console.log(postdata)
  let user = {
    name: postdata.name,
    pwd: postdata.pwd
  }
  let msg = await updatauser(user.name, user.pwd)
  let state = false
  let message = '密码修改失败'
  if (msg === 1) {
    state = true
    message = "密码修改成功"
  }
  console.log(ctx)
  ctx.response.body = {
    state: ctx.response.status,
    success: state,
    data: message
  }
})

getData()
// 装载所有子路由
let router = new Router()
router.use('/', home.routes(), home.allowedMethods(), )
// router.use('/page', page.routes(), page.allowedMethods())

// 加载路由中间件
app.use(router.routes()).use(router.allowedMethods())
app.use(cors())
// app.use(cors({
//   exposeHeaders: ['WWW-Authenticate', 'Server-Authorization', 'Date'],
//   maxAge: 100,
//   credentials: true,
//   allowMethods: ['GET', 'POST', 'OPTIONS'],
//   allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Custom-Header', 'anonymous'],
// }));


app.listen(3001, (ctx) => {
  console.log('3001')
})