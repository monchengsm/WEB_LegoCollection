const setData = require("../data/setData");
const themeData = require("../data/themeData");

let sets = [];

function initialize() {
  return new Promise((resolve, reject) => {
    setData.forEach((data) => {
      //add the setData first
      sets.push(data);
    });

    sets.forEach((data) => {
      let matchedTheme = themeData.find(
        (element) => element.id === data.theme_id
      );
      data.theme = matchedTheme.name;
    });
    resolve();
  });
}

function getAllSets() {
  return new Promise((resolve, reject) => {
    resolve(sets);
  });
}

function getSetByNum(setNum) {
  return new Promise((resolve, reject) => {
    let result = sets.find((element) => element.set_num === setNum);
    result ? resolve(result) : reject("Unable to find request set");
  });
}

function getSetsByTheme(theme) {
  return new Promise((resolve, reject) => {
    let result = sets.filter((element) =>
      element.theme.toLowerCase().includes(theme.toLowerCase())
    );
    result.length > 0 ? resolve(result) : reject("Unable to find request set");
  });
}

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme };

/** Testing **/
/*initialize();
let theme = "tech";
getSetsByTheme(theme).then((data) => {
  console.log(data);
});*/
