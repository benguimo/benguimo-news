exports.handlePsqlErrors = (err, req, res, next) => {
	if (err.code === '22P02') {
		res.status(400).send({ msg: 'Bad Request' });
	} else {
		next(err);
	}
};

exports.handleCustomErrors = (err, req, res, next) => {
	if (err.msg) {
		res.status(err.status).send({ msg: err.msg });
	} else {
		next(err);
	}
};

exports.catchAll = (err, req, res, next) => {
	console.log(err, '==== Errors Controller: UNHANDLED ERROR! ====');
	res.status(500).send({ msg: 'Internal Server Error' });
};