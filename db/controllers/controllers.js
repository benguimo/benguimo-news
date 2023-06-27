const { selectAllTopics, selectArticleById} = require("../models/models")
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

