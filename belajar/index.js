const express = require("express");
const port = 3000;
const path = require("path");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const db_name = path.join(__dirname, "data", "bread.db");
// let db = new sqlite3.Database('./data.db', sqlite3.OPEN_READWRITE);
let db = new sqlite3.Database(db_name, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log(`Successful connection to the database 'bread.db'`);
});

const app = express();

// server configuration
app.set("views", path.join(__dirname, "view"));
app.set("view engine", "ejs");
app.use("/", express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  let result = [];
  let filterData = false;

  if (req.query.check_id && req.query.id) {
    result.push(`id = ${req.query.id}`);
    filterData = true;
  }
  if (req.query.check_string && req.query.string) {
    result.push(`string = '${req.query.string}'`);
    filterData = true;
  }
  if (req.query.check_integer && req.query.integer) {
    result.push(`integer = ${req.query.integer}`);
    filterData = true;
  }
  if (req.query.check_float && req.query.float) {
    result.push(`float = '${req.query.float}'`);
    filterData = true;
  }
  if (req.query.check_date && req.query.startDate && req.query.endDate) {
    result.push(
      `date BETWEEN '${req.query.startDate}' AND '${req.query.endDate}'`
    );
    filterData = true;
  }
  if (req.query.check_boolean && req.query.boolean) {
    result.push(`boolean = '${req.query.boolean}'`);
    filterData = true;
    console.log(req.query);
  }

  let sql = `SELECT COUNT(*) AS total FROM data`;
  if (filterData) {
    sql += ` WHERE ${result.join(' AND ')}`;
  }
  db.all(sql, (err, count) => {
    const page = req.query.page || 1;
    const limit = 5;
    const offset = (page - 1) * limit;
    const url = req.url == "/" ? "/?page=1" : req.url;
    const total = count[0].total;
    const pages = Math.ceil(total / limit);
    let sql = `SELECT * FROM data`;
    if (filterData) {
      sql += ` WHERE ${result.join(" AND ")}`;
    }
    sql += ` LIMIT ${limit} OFFSET ${offset}`;

    db.all(sql, (err, row) => {
      if (err) {
        return console.error(err.message);
      }
      res.render("index", {
        data: row,
        page,
        pages,
        query: req.query,
        url
      });
    });
  });
});

app.get("/add", (req, res) => {
  res.render("add");
});

app.post("/add", (req, res) => {
  const sql = `INSERT INTO data (string, integer, float, date, boolean) VALUES (?, ?, ?, ?, ?)`;
  const input = [
    req.body.string,
    req.body.integer,
    req.body.float,
    req.body.date,
    req.body.boolean
  ];

  db.run(sql, input, err => {
    if (err) {
      return console.error(err.message);
    }
  });
  res.redirect("/");
});

app.get("/edit/:id", (req, res) => {
  const id = req.params.id;
  const sql = `SELECT * FROM data WHERE id = ?`;

  db.get(sql, id, (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("edit", { item: row });
  });
});

app.post("/edit/:id", (req, res) => {
  const id = req.params.id;
  const { string, integer, float, date, boolean } = req.body;
  const sql = `UPDATE data SET string = '${string}', integer = '${integer}', float = '${float}', date = '${date}', boolean = '${boolean}' WHERE id = ${id}`;

  db.run(sql, err => {
    if (err) {
      return console.error(err.message);
    }
    res.redirect("/");
  });
});

app.get("/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = `DELETE FROM data WHERE id = ${id}`;

  db.run(sql, err => {
    if (err) {
      console.error(err.message);
    }
    res.redirect("/");
  });
});

app.listen(port, () => console.log(`This app working on port ${port}!`));