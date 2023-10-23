// Name: SIU MAN CHENG
// ID: 121104228

const express = require("express");
const legoData = require("./modules/legoSets");
const app = express();
const HTTP_PORT = process.env.PORT || 3000;

const path = require("path");
app.use(express.static("public"));

legoData.initialize();

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/home.html"));
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/about.html"));
});

app.get("/lego/sets", (req, res) => {
  let result = legoData.getAllSets();

  if (req.query.theme) {
    const theme = req.query.theme;
    result = legoData.getSetsByTheme(theme);
  } else {
    res.status(404).sendFile(path.join(__dirname, "/views/404.html"));
  }

  result
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      res.status(404).sendFile(path.join(__dirname, "/views/404.html"));
    });
});

app.get("/lego/sets/:num", (req, res) => {
  const num = req.params.num;
  legoData
    .getSetByNum(num)
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      res.status(404).sendFile(path.join(__dirname, "/views/404.html"));
    });
});

app.get("/lego/sets/num-demo", (req, res) => {
  legoData
    .getSetByNum("001-1")
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      res.json(error);
    });
});

app.get("/lego/sets/theme-demo", (req, res) => {
  legoData
    .getSetsByTheme("Technic")
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      res.json(error);
    });
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "/views/404.html"));
});

app.listen(HTTP_PORT, () => console.log(`server listening on: ${HTTP_PORT}`));
