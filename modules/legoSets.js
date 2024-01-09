require("dotenv").config();
const Sequelize = require("sequelize");

let sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.log("Unable to connect to the database:", err);
  });

const Theme = sequelize.define(
  "Theme",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: Sequelize.STRING,
  },
  {
    createdAt: false,
    updatedAt: false,
  }
);

const Set = sequelize.define(
  "Set",
  {
    set_num: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    name: Sequelize.STRING,
    year: Sequelize.INTEGER,
    num_parts: Sequelize.INTEGER,
    theme_id: Sequelize.INTEGER,
    img_url: Sequelize.STRING,
  },
  {
    createdAt: false,
    updatedAt: false,
  }
);

Set.belongsTo(Theme, { foreignKey: "theme_id" });

function initialize() {
  return new Promise(async (resolve, reject) => {
    try {
      await sequelize.sync();
      resolve();
    } catch (err) {
      reject(err.message);
    }
  });
}

function getAllSets() {
  return new Promise((resolve, reject) => {
    Set.findAll({
      include: [Theme],
    })
      .then((sets) => {
        resolve(sets);
      })
      .catch((err) => {
        reject(err.message);
      });
  });
}

function getSetByNum(setNum) {
  return new Promise((resolve, reject) => {
    Set.findAll({
      where: {
        set_num: setNum,
      },
      include: [Theme],
    })
      .then((sets) => {
        resolve(sets[0]);
      })
      .catch((err) => {
        reject("Unable to find request set");
      });
  });
}

function getSetsByTheme(theme) {
  return new Promise((resolve, reject) => {
    Set.findAll({
      include: [Theme],
      where: {
        "$Theme.name$": {
          [Sequelize.Op.iLike]: `%${theme}%`,
        },
      },
    })
      .then((sets) => {
        resolve(sets);
      })
      .catch((err) => {
        reject("Unable to find request set");
      });
  });
}

function addSet(setData) {
  return new Promise((resolve, reject) => {
    Set.create({
      set_num: setData.set_num,
      name: setData.name,
      year: setData.year,
      num_parts: setData.num_parts,
      img_url: setData.img_url,
      theme_id: setData.theme_id,
    })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err.errors[0].message);
      });
  });
}

function getAllThemes() {
  return new Promise((resolve, reject) => {
    Theme.findAll({})
      .then((themes) => {
        resolve(themes);
      })
      .catch((err) => {
        reject(err.message);
      });
  });
}

function editSet(set_num, setData) {
  return new Promise((resolve, reject) => {
    Set.update(
      {
        name: setData.name,
        year: setData.year,
        num_parts: setData.num_parts,
        img_url: setData.img_url,
        theme_id: setData.theme_id,
      },
      {
        where: { set_num: set_num },
      }
    )
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err.errors[0].message);
      });
  });
}

function deleteSet(set_num) {
  return new Promise((resolve, reject) => {
    Set.destroy({
      where: { set_num: set_num },
    })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err.errors[0].message);
      });
  });
}

module.exports = {
  initialize,
  getAllSets,
  getSetByNum,
  getSetsByTheme,
  getAllThemes,
  addSet,
  editSet,
  deleteSet,
};

/** Testing **/
/*initialize();
let theme = "tech";
getSetsByTheme(theme).then((data) => {
  console.log(data);
});*/
