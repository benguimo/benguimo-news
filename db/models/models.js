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
  SELECT articles.article_id, title, topic, articles.author, articles.created_at, articles.votes, article_img_url, 
  COUNT(comment_id) AS comment_count
  FROM articles
  LEFT JOIN comments ON articles.article_id = comments.article_id
  GROUP BY articles.article_id
  ORDER BY articles.created_at DESC;
`).then(({rows: articles}) => {
      return articles
  })
};      





exports.selectComments = (article_id) => {
  return db
  .query(`SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC;`, [article_id])
  .then(({ rows: comments }) => {
    if(comments.length === 0) {
      return Promise.reject({ status: 404, msg: 'Not Found' })
    }
    return comments
  });
};





exports.insertComment = (article_id, comment) => {
  const { username, body } = comment

      if (!username || !body) {
        return Promise.reject({ status: 400, msg: "Bad Request" })
      }
  
  const newComment = {
    author: username,
    article_id,
    body,
    created_at: Date.now().toString()
  }
  
  return db
      .query(
        "INSERT INTO comments (article_id, author, body) VALUES ($1, $2, $3) RETURNING *;",
        [article_id, username, body]
      )
      .then((result) => {
        const [comment] = result.rows
        comment.username = newComment.author
        comment.created_at = newComment.created_at
        return comment;
      })
  }



  exports.updateArticleById = (article_id, inc_votes) => {
    if (!inc_votes || typeof inc_votes !== "number") {
      return Promise.reject({ status: 400, msg: 'Bad Request' });
    }
    return db
      .query('UPDATE articles SET votes = votes + $2 WHERE article_id = $1 RETURNING *', [article_id, inc_votes])
      .then((result) => {
        if (!result.rows.length) {
          return Promise.reject({ status: 404, msg: 'Not Found' });
        }
        return result.rows[0];
      });
  };



  exports.removeCommentById = (comment_id) => {
    return db.query('SELECT * FROM comments WHERE comment_id = $1;', [comment_id]).then((comments) => {
      if (!comments.rows.length) {
        return Promise.reject({ status: 404, msg: 'Not Found' });
      }
      return db.query('DELETE FROM comments WHERE comments.comment_id = $1;', [comment_id]).then((comments) => {
        return comments.rows;
      });
    });
  };