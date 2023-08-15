const db = require("../connection")




exports.selectAllTopics = () => {
return db.query(`SELECT * FROM topics;`).then(({rows}) => {
  return {topics: rows}
  })
}




exports.selectArticleById = (article_id) => {
  return db
  .query(
			`SELECT
      articles.article_id,
      articles.title,
      articles.topic,
      articles.author,
      articles.body,
      articles.created_at,
      articles.votes,
      articles.article_img_url,
      COUNT(comments.article_id) AS comment_count
    FROM
      articles
    JOIN
      comments ON articles.article_id = comments.article_id
    WHERE
      articles.article_id = $1
    GROUP BY
      articles.article_id;`,
			[article_id]
		)
    
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





exports.selectAllArticles = (topic, sort_by = 'created_at', order = 'DESC') => {

  let values = []

	const sortBy = [
		'article_id',
		'title',
		'topic',
    'comment_count',
		'author',
		'created_at',
		'votes',
		'article_img_url']


	if (!sortBy.includes(sort_by)) {
		return Promise.reject({ status: 400, msg: 'Bad request' });
	}


	let query = `SELECT articles.article_id, title, topic, articles.author, articles.created_at, articles.votes, article_img_url, 
  COUNT(comment_id) AS comment_count
  FROM articles
  LEFT JOIN comments ON articles.article_id = comments.article_id `;

  
	if (topic) {
		const validTopics = ['mitch', 'cats', 'paper'];
      if (!validTopics.includes(topic))  return Promise.reject({ status: 404, msg: 'Not Found' });
     
		query += `WHERE articles.topic = $1 `;
		values.push(topic);
	}

	query += `GROUP BY articles.article_id ORDER BY ${sort_by} `;

	if (order) {
		const expectedSortBy = ['desc', 'DESC', 'asc', 'ASC', ];
		  if (!expectedSortBy.includes(order))  return Promise.reject({ status: 400, msg: 'Bad request' });
		query += `${order};`;
	}


	return db.query(query, values).then((result) => {
		return result.rows;
	});
};






exports.checkArticleId = (id) => {
	return db
		.query(`SELECT * FROM articles WHERE article_id = $1`, [id])
		.then((body) => {
			if (body.rows.length === 0) {
				return Promise.reject({ status: 404, msg: 'Not Found' });
			}
		});
};

exports.checkArticleId = (id) => {
	return db
		.query(`SELECT * FROM articles WHERE article_id = $1`, [id])
		.then((body) => {
			if (body.rows.length === 0) {
				return Promise.reject({ status: 404, msg: 'Not Found' });
			}
		});
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


exports.insertComment = (body, article_id) => {
	return db
		.query(`INSERT INTO comments (author, body, article_id) VALUES ($1, $2, $3) RETURNING*;`,
			[body.username, body.body, article_id])
		.then((comment) => {
			return comment.rows;
		})
  }

  



  exports.updateArticleById = (article_id, inc_votes) => {
    return db
      .query('UPDATE articles SET votes = votes + $2 WHERE article_id = $1 RETURNING *;', [article_id, inc_votes])
      .then((result) => {
        if (!result.rows.length) {
          return Promise.reject({ status: 404, msg: 'Not Found' });
        }
        return result.rows[0];
      });
  };


  

  exports.removeCommentById = (comment_id) => {
    return db.query('SELECT * FROM comments WHERE comment_id = $1;', [comment_id]).then((comments) => {
      if (comments.rows.length === 0) {
        return Promise.reject({ status: 404, msg: 'Not Found' });
      }
      return db.query('DELETE FROM comments WHERE comments.comment_id = $1;', [comment_id]).then((comments) => {
        return comments.rows;
      });
    })
   }


   exports.selectUsers = () => {
    return db.query(`SELECT * FROM users`).then((users) => {
      return users.rows;
    });
  }
  
