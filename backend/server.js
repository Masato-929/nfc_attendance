import express from "express";
import bodyParser from "body-parser";
import mysql from "mysql";
const app = express()
const port = 3000;
const con =mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password:'kobakoba'//envにパスワードは移行することも検討
});

con.connect(function(err){
    if (err) throw err;
    console.log(`Connected`);
})

// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
// app.post('/',(req,res)=>
// {
//     console.log(req.body)
//     res.send('Hello World!')    
// })
//  app.listen(port,()=>{
//      console.log(`Example app listening on port ${port}`)
//  })