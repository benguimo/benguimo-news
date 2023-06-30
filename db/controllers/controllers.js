const { selectAllTopics, selectArticleById, selectAllArticles, checkArticleId,
        insertComment, selectComments, updateArticleById, checkCommentId, removeCommentById } = require("../models/models")
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

    const body = req.body
    const article_id = req.params.article_id

    checkArticleId(article_id)
    .then(() => {
      return insertComment(body, article_id)
    })
    .then((comment) => {
      res.status(201).send(comment);
    })
    .catch(next);
  };

  exports.patchArticleById = (req, res, next) => {
    const { article_id } = req.params
    const { inc_votes } = req.body

    checkArticleId(article_id)
    .then(() => {
       return updateArticleById(article_id, inc_votes)
     })

    .then((article) => {
        res.status(201).send({ article })
    })
    .catch(next)
  }
  


  exports.deleteCommentById = (req, res, next) => {
    const { comment_id } = req.params;

    checkCommentId(comment_id)
    .then(() => {
      return removeCommentById(comment_id)
    })
      .then(() => { 
        res.status(204).send()
      })
      .catch(next)
  }

