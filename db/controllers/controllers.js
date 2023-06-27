const { selectAllTopics, selectArticleById, selectAllArticles} = require("../models/models")
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
		.catch(next);
};

exports.getAllArticles = (req, res, next) => {
    selectAllArticles().then((articles) => {
        res.status(200).send({ articles });
      })
      .catch((err) => {
        next(err);
      });
  };


