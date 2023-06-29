const { selectAllTopics, selectArticleById, selectAllArticles, insertComment, selectComments, updateArticleById} = require("../models/models")
const endpoints = require('../../endpoints.json');

exports.getApi = (req, res, next) => {
 res.status(200).send( endpoints );

}

exports.getAllTopics = (req, res) => {
    selectAllTopics().then((topics) => {
      res.status(200).send(topics);
    });
  };


exports.getArticleById = (req, res, next) => {
	const { article_id } = req.params;
	selectArticleById(article_id)
		.then((article) => {
			res.status(200).send({ article });
		})
    .catch((err) => {
      next(err);
    });
};

exports.getAllArticles = (req, res, next) => {
    selectAllArticles().then((articles) => {
        res.status(200).send({ articles });
      })
      .catch((err) => {
        next(err);
      });
  };


  exports.getComments = (req, res, next) => {
    const { article_id } = req.params;
    selectComments(article_id)
      .then((comments) => {
        res.status(200).send({ comments });
      })
      .catch(next);
  };
  
  exports.postComment = (req, res, next) => {
    const { article_id } = req.params;
    const { body, username } = req.body;
    const comment = { body, username };
  
    selectArticleById(article_id)
      .then((article) => {
        if (!article) {
          return Promise.reject({ status: 404, msg: 'Not Found' });
        }
  
        return insertComment(article_id, comment);
      })
      .then((comment) => {
        res.status(201).send({ comment });
      })
      .catch(next);
  };

  exports.patchArticleById = (req, res, next) => {
    const { article_id } = req.params;
    const { inc_votes } = req.body;
    updateArticleById(article_id, inc_votes)
      .then((article) => {
        res.status(200).send({ article });
      })
      .catch(next);
  };
