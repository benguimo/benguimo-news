const express = require("express")
const { getApi, getAllTopics } = require("./controllers/controllers")


const app = express();
app.use(express.json());

app.get("/api", getApi);
app.get("/api/topics", getAllTopics);

app.use((err, req, res, next) => {
      res.status(404).send({ message: 'Not found'});

  });

module.exports = app;