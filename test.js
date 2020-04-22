const path = require('path')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const port = 3000;
const sqlite3 = require('sqlite3').verbose();

app.set('views', path.join(__dirname, '/view'))
app.set('view engine', 'ejs')

let db = new sqlite3.Database('./data.db', sqlite3.OPEN_READWRITE);

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

// please edit pagination for code below

app.get('/', (req, res) => {

    const page = req.query.page || 1;
    const limit = 5;
    let offset = (page - 1) * limit

    db.all(`SELECT COUNT (ID) as total FROM jenisdata`, (err, rows) => {
        if (err) {
            return res.send(err);
        } else if (rows == 0) {
            return res.send(`data can not be found`);
        } else {
            total = rows[0].total;
            const pages = Math.ceil(total / limit);

            let sql = `SELECT * FROM jenisdata LIMIT ? OFFSET ? `
            db.all(sql, [limit, offset], (err, rows) => {
                if (err) {
                    return res.send(err);
                } else if (rows == 0) {
                    return res.send(`data can not be found`);
                }
                else {
                    let data = [];
                    rows.forEach(row => {
                        data.push(row);
                    });
                    res.render('list', { data, page, pages })
                }
            });
        }
    });
});


app.get('/add', (req, res) => {
    res.render('add');
});



// FILTER


// let data = {
//     id = [query.checkId, query.id],
//     string = [query.checkString, query.string],
//     integer = [query.checkInteger, query.integer],
//     float = [query.checkFloat, query.float],
//     date = [query.checkDate, query.date],
//     bool= [query.checkBool, query.bool]
// }

// if (data) {

//     let sql = `SELECT * FROM jenisdata WHERE `
//     for (const key in data) {
//         if (data[key][0] == 'on' && data[key][1] != null) {
//             sql += (`${key} = "${data[key][1]}" AND `);
//         }
//     }

//     let arr = sql.split(" ");
//     arr.splice(arr.length - 2, 2);

//     let query = arr.join(" ");
//     db.all(query, (err, rows) => {
//         let data = [];
//         if (err) {
//             res.send(`can't access database`);
//         }
//         if (rows) {
//             rows.forEach(row => {
//                 data.push(row)
//             })
//             res.render('list', { data })
//         }
//     });
//     // =============================
// } else {
// let sql = `SELECT * FROM jenisdata`
// 

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
    let sql = `UPDATE jenisdata SET string = ? , integer = ?, float = ?, date = ?, boolean = ? WHERE ID = ?`
    db.run(sql, baru, (err) => {
        if (err) throw err;
    })
    res.redirect('/');
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));



// LAST UPDATE :
// THERE ARE STILL BUG IN SEARCH FEATURE FOR DATE, BOOLEAN, AND ID FILTERS PLEASE REVISED!
// PLEASE MAKE PAGINATION