module.exports = {
  hello: async (ctx, next) => {
    console.log(ctx)
    ctx.response.body = 'Hello World'
  }
}