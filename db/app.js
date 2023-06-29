const express = require("express")
const { getApi, getAllTopics, getArticleById, getAllArticles, getArticleComments } = require("./controllers/controllers")

const {
  handlePsqlErrors,
  handleCustomErrors,
  catchAll
} = require("./errors")


const app = express();




app.get("/api", getApi);
app.get("/api/topics", getAllTopics);
app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles", getAllArticles);
app.get("/api/articles/:article_id/comments", getArticleComments);

app.all("*", (_, res) => {
  res.status(404).send({msg: "Not found"})
})

app.use(handlePsqlErrors);
app.use(handleCustomErrors);
app.use(catchAll);



module.exports = app;