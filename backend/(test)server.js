import express from "express";
import bodyParser from "body-parser";
import mysql from "mysql";
const app = express();
const port = 3000;
const con =mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password:'kobakoba',//envにパスワードは移行することも検討
    database: 'Attendanceclass'
});

con.connect(function(err){
    if (err) throw err;
    console.log(`Connected`);
});
    // con.query('CREATE DATABASE express_db3', function (err, result) {
    //     if (err) throw err; 
    //       console.log(result);
    //     });
    // const sql = 'CREATE TABLE users (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL)';
	// con.query(sql, function (err, result) {  
	// if (err) throw err;  
	// console.log('table created');  
    // });
    // const sql = "select * from users"
	// con.query(sql, function (err, result, fields) {  
	// if (err) throw err;  
	// console.log(result)
	// });
    const sql = "INSERT INTO users(name,email) VALUES('kevin','kevin@test.com')"

    con.query(sql,function(err, result, fields){
        if (err) throw err;
        console.log(result)
    })
    
  app.listen(port,()=>{
    console.log(`Example app listening on port ${port}`)
  });
    app.get('/', (request, response) => {
        const sql = "select * from users"
        con.query(sql, function (err, result, fields) {  
        if (err) throw err;
        response.send(result)
        });
      });
    


// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
// app.post('/',(req,res)=>
// {
//     console.log(req.body)
//     res.send('Hello World!')    
// })
 
//  })
