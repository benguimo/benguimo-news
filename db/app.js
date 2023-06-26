const express = require("express")
const { getApi } = require("./controllers/controllers")

const app = express();
app.use(express.json());

app.get("/api", getApi);

app.use((err, req, res, next) => {
	if (err.code) res.status(400).send({ msg: "Bad request" });
    if (err.msg)  res.status(err.status).send({ msg: err.msg });
	else next(err);
});

module.exports = app;