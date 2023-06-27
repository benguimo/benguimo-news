const express = require("express")
const { getApi, getAllTopics, getArticleById } = require("./controllers/controllers")

const {
  handlePsqlErrors,
  handleCustomErrors,
  catchAll
} = require("./errors")


const app = express();
app.use(express.json());

app.get("/api", getApi);
app.get("/api/topics", getAllTopics);
app.get("/api/articles/:article_id", getArticleById);

/* app.use((err, req, res, next) => {
      res.status(404).send({ message: 'Not found'});

  }); */


  app.use(handlePsqlErrors);
  app.use(handleCustomErrors);
  app.use(catchAll);


module.exports = app;