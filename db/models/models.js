const db = require("../connection")

exports.selectAllTopics = () => {
return db.query(`SELECT * FROM topics;`).then(({rows}) => {
return {topics: rows}
  })
}


