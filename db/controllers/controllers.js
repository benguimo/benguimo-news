const { selectAllTopics} = require("../models/models")
const endpoints = require('../../endpoints.json');

exports.getApi = (req, res, next) => {
 res.status(200).send({ endpoints });

}

exports.getAllTopics = (req, res) => {
    selectAllTopics().then((topics) => {
        res.status(200).send(topics)
    })
}