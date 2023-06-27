const db = require("../connection")

exports.selectAllTopics = () => {
return db.query(`SELECT * FROM topics;`).then(({rows}) => {
  return {topics: rows}
  })
}


exports.selectArticleById = (article_id) => {
  return db
  .query('SELECT * FROM articles WHERE article_id = $1;', [article_id])
      .then(({ rows }) => {
          const article = rows[0];
          if (!article) {
            return Promise.reject({
              status: 404,
              msg: 'Not Found',
            });
          }
          return article;
        })
      }

exports.selectAllArticles = () => {
  return db.query(`
  SELECT articles.*, COUNT(comment_id) AS comment_count
  FROM articles 
  LEFT JOIN comments 
      ON articles.article_id = comments.article_id
      GROUP BY articles.article_id;
  `).then(({rows: articles}) => {
      return articles
  })
};      