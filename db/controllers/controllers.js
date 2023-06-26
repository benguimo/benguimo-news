const { selectAllTopics} = require("../models/models")

exports.getApi = (req, res) => {
    res.status(200).send({msg: "All OK"})
}

exports.getAllTopics = (req, res) => {
    selectAllTopics().then((topics) => {
        res.status(200).send(topics)
    })
}