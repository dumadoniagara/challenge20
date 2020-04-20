const path = require('path')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const port = 3000;
const sqlite3 = require('sqlite3').verbose();

const fs = require('fs');

app.set('views', path.join(__dirname, '/view'))
app.set('view engine', 'ejs')

let db = new sqlite3.Database('./data.db', sqlite3.OPEN_READWRITE);

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());


app.get('/', (req, res) => {
    let sql = `SELECT * FROM jenisdata`
    db.all(sql, [], (err, rows) => {
        if (err) throw err;
        if (rows) {
            let data = [];
            rows.forEach(row => {
                data.push(row);
            });
            res.render('list', { data });
        }
    })
})

app.get('/add', (req, res) => {
    res.render('add');
});

app.post('/add', (req, res) => {
    let hasil = req.body;
    db.serialize(() => {
        let sql = (`INSERT INTO jenisdata (string, integer, float, date, boolean)
        VALUES(?,?,?,?,?)`)
        db.run(sql, [hasil.string, parseInt(hasil.integer), parseFloat(hasil.float), hasil.date, hasil.boolean], (err) => {
            if (err) {
                throw err;
            }
            res.redirect('/');
        });
    });
});

app.get('/delete/:id', (req, res) => {
    let id = req.params.id;
    let sql = `DELETE FROM jenisdata WHERE ID = ?`
    db.run(sql, id, (err) => {
        if (err) throw err;
    })
    res.redirect('/');
});

app.get('/edit/:id', (req, res) => {
    const id = req.params.id;
    let sql = `SELECT * FROM jenisdata WHERE ID = ?`
    db.get(sql, id, (err, row) => {
        if (err) {
            return console.error(err.message);
        }
        res.render('edit', { row });
    });
});

app.post('/edit/:id', (req, res) => {
    let id = req.params.id;
    let baru = [req.body.string, parseInt(req.body.integer), parseFloat(req.body.float), req.body.date, req.body.boolean, id]

    // res.json(edit);
    let sql = `UPDATE jenisdata SET string = ? , integer = ?, float = ?, date = ?, boolean = ? WHERE ID = ?`
    db.run(sql, baru, (err) => {
        if (err) throw err;
    })
    res.redirect('/');
})

// FILTER 
app.get('/filter', (req, res) => {
    res.render('filter');
})

app.post('/filter', (req, res) => {
    let data = {
        id: [req.body.checkId, req.body.id],
        string: [req.body.checkString, req.body.string],
        integer: [req.body.checkInteger, req.body.integer],
        float: [req.body.checkFloat, req.body.float],
        boolean: [req.body.checkBollean, req.body.boolean],
        date: [req.body.checkDate, req.body.date]
    }

    let sql = `SELECT * FROM jenisdata WHERE `
    for (const key in data) {
        if (data[key][0] == 'on' && data[key][1] != null) {
            sql += (`${key} = "${data[key][1]}" AND `);
        }
    }

    let arr = sql.split(" ");
    arr.splice(arr.length - 2, 2);

    let query = arr.join(" ");
    db.all(query, (err, rows) => {
        let data = [];
        if (err) {
            res.send(`can't access database`);
        }
        if (rows) {
            rows.forEach(row => {
                data.push(row)
            })
            res.render('list', { data })
        }
    })
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));