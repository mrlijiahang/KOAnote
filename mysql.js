const mysql = require('mysql')

// 创建数据池
const pool  = mysql.createPool({
  host     : '127.0.0.1',   // 数据库地址
  user     : 'root',    // 数据库用户
  password : '123456',   // 数据库密码
  database : 'hotmap'  // 选中数据库
})
 
// 在数据池中进行会话操作
pool.getConnection(function(err, connection) {
   
  connection.query('SELECT * FROM hotmapkey',  (error, results, fields) => {
    console.log(results)
    console.log(fields)
    
    // 结束会话
    connection.release();
 
    // 如果有错误就抛出
    if (error) throw error;
  })
})