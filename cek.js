const path = require('path')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const port = 8080;
const sqlite3 = require('sqlite3').verbose();

app.set('views', path.join(__dirname, '/view'))
app.set('view engine', 'ejs')

let db = new sqlite3.Database('./data.db', sqlite3.OPEN_READWRITE);

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.get('/', (req, res)=>{
    res.render('bootstrap');
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));