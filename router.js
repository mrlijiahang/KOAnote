const router = require('koa-router')()
const Controller =require('./controller.js')
const koa = require('koa')
const app = new koa()
app.use(router.routes())
module.exports = app => {
  router.get('/', Controller.hello) // 注意是在controller编写的hello函数
}