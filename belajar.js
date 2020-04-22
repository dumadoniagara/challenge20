const path = require('path')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const port = 3000;
// const sqlite3 = require('sqlite3').verbose();

app.set('views', path.join(__dirname, '/view'))
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.get('/',(req, res)=>{
    console.log(req.query)
    res.render('belajar',{qs:req.query});
})

app.listen(8080, ()=>{
    console.log(`You're connected to port 8080, click here http://localhost:8080`)
})