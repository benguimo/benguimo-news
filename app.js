const express = require("express")
const { getApi, getAllTopics, getArticleById, 
        getAllArticles, postComment, getComments,
        patchArticleById, deleteCommentById, getUsers } = require("./db/controllers/controllers")


const cors = require('cors')
const app = express()


const {
  handlePsqlErrors,
  handleCustomErrors,
  catchAll
} = require("./db/errors")


app.use(cors())
app.use(express.json())



app.get("/api", getApi);
app.get("/api/topics", getAllTopics);
app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles", getAllArticles);
app.post('/api/articles/:article_id/comments', postComment);
app.get("/api/articles/:article_id/comments", getComments);
app.patch("/api/articles/:article_id", patchArticleById);
app.delete("/api/comments/:comment_id", deleteCommentById);

app.get("/api/users", getUsers);  



app.all("*", (_, res) => {
  res.status(404).send({msg: "Not Found"})
})

app.use(handlePsqlErrors);
app.use(handleCustomErrors);
app.use(catchAll);



module.exports = app;