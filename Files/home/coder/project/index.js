const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const mustacheExpress = require('mustache-express');

const app = express();
const webPort = 8088;

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "VideoGameSales"
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("Connected to the VideoGameSales database");
});

app.engine('html', mustacheExpress());
app.set('view engine', 'html');
app.set('views', './templates');
app.use(bodyParser.urlencoded({ extended: true }));

function templateRenderer(template, response) {
  return function (error, results, fields) {
    if (error) {
      throw error;
    }
    response.render(template, { data: results });
  };
}

// Landing Page
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

// Question 1: Most Popular Video Game Genres
app.get('/popular-genres', function (req, res) {
  db.query("SELECT Genre, COUNT(*) as GameCount FROM Game GROUP BY Genre ORDER BY GameCount DESC", templateRenderer('genre', res));
});

// Question 2: Platforms with the Highest Global Sales
app.get('/platform-sales', function (req, res) {
  const query = `
    SELECT g.Platform_Name, SUM(s.Global_Sales) AS TotalSales
    FROM Game g
    JOIN Sales s ON g.Name = s.Game_Name  
    GROUP BY g.Platform_Name
    ORDER BY TotalSales DESC;
  `;
  db.query(query, templateRenderer('platform', res));
});

// Question 3: Top N Games by Sales
app.get('/top-games', function (req, res) {
  const query = `
    SELECT g.Name, s.Global_Sales
    FROM Game g
    JOIN Sales s ON g.Name = s.Game_Name
    ORDER BY s.Global_Sales DESC
    LIMIT 10;
  `;
  db.query(query, templateRenderer('top_games', res));
});

// Question 4: Average Sales by Genre
app.get('/average-sales-by-genre', function (req, res) {
  const query = `
    SELECT g.Genre, AVG(s.Global_Sales) as AverageSales
    FROM Game g
    JOIN Sales s ON g.Name = s.Game_Name
    GROUP BY g.Genre;
  `;
  db.query(query, templateRenderer('average_sales_by_genre', res));
});


app.listen(webPort, () => console.log('Video Game Sales app listening on port ' + webPort));
