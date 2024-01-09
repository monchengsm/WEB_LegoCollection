/********************************************************************************
 * WEB322 – Assignment 06
 *
 * I declare that this assignment is my own work in accordance with Seneca's
 * Academic Integrity Policy:
 *
 * https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
 *
 * Name: SIU MAN CHENG Student ID: 121104228 Date: 1 DEC 2023
 *
 * Published URL: https://puce-magnificent-walrus.cyclic.app/
 *
 ********************************************************************************/

const express = require("express");
const legoData = require("./modules/legoSets");
const authData = require("./modules/auth-service.js");
const clientSessions = require("client-sessions");
const app = express();
const HTTP_PORT = process.env.PORT || 3000;

const path = require("path");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.use(
  clientSessions({
    cookieName: "session", // this is the object name that will be added to 'req'
    secret: "WEB322_Assignment6", // this should be a long un-guessable string.
    duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60, // the session will be extended by this many ms each request (1 minute)
  })
);

//session middleware
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

//ensureLogin - check if a user logged in (helper middleware function)
function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}

//legoData.initialize();

legoData
  .initialize()
  .then(authData.initialize)
  .then(function () {
    app.listen(HTTP_PORT, function () {
      console.log(`app listening on:  ${HTTP_PORT}`);
    });
  })
  .catch(function (err) {
    console.log(`unable to start server: ${err}`);
  });

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/login", (req, res) => {
  res.render("login", { errorMessage: null });
});

app.post("/login", async (req, res) => {
  req.body.userAgent = req.get("User-Agent");

  try {
    await authData.checkUser(req.body).then((user) => {
      req.session.user = {
        userName: user.userName, // authenticated user's userName
        email: user.email, // authenticated user's email
        loginHistory: user.loginHistory, // authenticated user's loginHistory
      };
      res.redirect("/lego/sets");
    });
  } catch (err) {
    res.render("login", { errorMessage: err, userName: req.body.userName });
  }
});

app.get("/register", (req, res) => {
  res.render("register", { successMessage: null, errorMessage: null });
});

app.post("/register", async (req, res) => {
  try {
    await authData.registerUser(req.body);

    res.render("register", { successMessage: "User created" });
    console.log("successMessage: Usercreated");
  } catch (err) {
    res.render("register", {
      successMessage: null,
      errorMessage: err,
      userName: req.body.userName,
    });
    console.log("errorMessage: " + err);
  }
});

app.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect("/");
});

app.get("/userHistory", ensureLogin, (req, res) => {
  res.render("userHistory");
});

app.get("/lego/sets", async (req, res) => {
  try {
    if (req.query.theme) {
      let legoSets = await legoData.getSetsByTheme(req.query.theme);
      res.render("sets", { sets: legoSets });
    } else {
      let legoSets = await legoData.getAllSets();
      res.render("sets", { sets: legoSets });
    }
  } catch (err) {
    res.status(404).render("404", {
      message: "Unable to find requested sets.",
    });
  }
});

app.get("/lego/sets/:num", async (req, res) => {
  try {
    let legoSet = await legoData.getSetByNum(req.params.num);

    if (!legoSet) {
      return res.status(404).render("404", {
        message: "Unable to find requested set.",
      });
    }

    res.render("set", { set: legoSet });
  } catch (err) {
    res.status(404).render("404", {
      message: "Unable to find requested set.",
    });
  }
});

app.get("/lego/editSet/:num", ensureLogin, async (req, res) => {
  try {
    let legoSet = await legoData.getSetByNum(req.params.num);

    if (!legoSet) {
      return res.status(404).render("404", {
        message: "Unable to find requested set.",
      });
    }

    let themeData = await legoData.getAllThemes();
    res.render("editSet", { themes: themeData, set: legoSet });
  } catch (err) {
    res.status(404).render("404", {
      message: err,
    });
  }
});

app.post("/lego/editSet", ensureLogin, async (req, res) => {
  try {
    await legoData.editSet(req.body.set_num, req.body);
    res.redirect("/lego/sets");
  } catch (err) {
    res.render("500", {
      message: `I'm sorry, but we have encountered the following error: ${err}`,
    });
  }
});

app.get("/lego/addSet", ensureLogin, async (req, res) => {
  try {
    let themeData = await legoData.getAllThemes();
    res.render("addSet", { themes: themeData });
  } catch (err) {
    res.render("400", { message: err });
  }
});

app.post("/lego/addSet", ensureLogin, async (req, res) => {
  try {
    await legoData.addSet(req.body);
    res.redirect("/lego/sets");
  } catch (err) {
    res.render("500", {
      message: `I'm sorry, but we have encountered the following error: ${err}`,
    });
  }
});

app.get("/lego/deleteSet/:num", ensureLogin, async (req, res) => {
  try {
    let legoSet = await legoData.deleteSet(req.params.num);
    res.redirect("/lego/sets");
  } catch (err) {
    res.render("500", {
      message: `I'm sorry, but we have encountered the following error: ${err}`,
    });
  }
});

app.use((req, res) => {
  res.status(404).render("404", {
    message: "I'm sorry, we're unable to find what you're looking for",
  });
});

//app.listen(HTTP_PORT, () => console.log(`server listening on: ${HTTP_PORT}`));
