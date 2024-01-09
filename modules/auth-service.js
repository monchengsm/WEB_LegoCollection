require("dotenv").config();

const mongoose = require("mongoose");
let Schema = mongoose.Schema;

const bcrypt = require("bcryptjs");

//loginHistorySchema

let loginHistorySchema = new Schema({
  dateTime: Date,
  userAgent: String,
});

//define new userSchema

let userSchema = new Schema({
  userName: {
    type: String,
    unique: true,
  },
  password: String,
  email: String,
  loginHistory: [loginHistorySchema],
});

let User;

function initialize() {
  return new Promise(function (resolve, reject) {
    let db = mongoose.createConnection(process.env.MONGODB);

    db.on("error", (err) => {
      reject(err); // reject the promise with the provided error
    });
    db.once("open", () => {
      User = db.model("users", userSchema);
      resolve();
    });
  });
}

function registerUser(userData) {
  return new Promise(function (resolve, reject) {
    if (userData.password !== userData.password2) {
      reject("Password do not match!");
    } else {
      //hashed password
      bcrypt
        .hash(userData.password, 10)
        .then((hash) => {
          let newUser = new User({
            userName: userData.userName,
            password: hash,
            email: userData.email,
            loginHistory: [],
          });
          newUser
            .save()
            .then(() => {
              console.log("New User saved.");
              resolve();
            })
            .catch((err) => {
              if (err.code == 11000) {
                reject("User Name already taken");
              } else {
                reject("There was an error creating the user: " + err);
              }
            });
        })
        .catch((err) => {
          console.log("There was an error encrypting the password"); // Show any errors during encryption
        });
    }
  });
}

function checkUser(userData) {
  return new Promise(function (resolve, reject) {
    User.find({ userName: userData.userName })
      .exec()
      .then((users) => {
        if (users.length == 0) {
          reject(`Unable to find user: ${userData.userName}`);
        } else
          bcrypt
            .compare(userData.password, users[0].password)
            .then((result) => {
              if (result === false) {
                reject(`Incorrect Password for user:  ${userData.userName}`);
              } else {
                if (users[0].loginHistory.length == 8) {
                  users[0].loginHistory.pop();
                }

                users[0].loginHistory.unshift({
                  dateTime: new Date().toString(),
                  userAgent: userData.userAgent,
                });

                User.updateOne(
                  { userName: users[0].userName },
                  { $set: { loginHistory: users[0].loginHistory } }
                )
                  .exec()
                  .then(() => {
                    resolve(users[0]);
                  })
                  .catch((err) => {
                    reject(`There was an error verifying the user:  ${err}`);
                  });
              }
            })
            .catch((err) => {
              reject(`Unable to find user: ${userData.userName}`);
            });
      });
  });
}

module.exports = {
  initialize,
  registerUser,
  checkUser,
};
