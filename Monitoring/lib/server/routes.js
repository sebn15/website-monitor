/**
 * @author Sébastien Haentjens
 */

const router = require('express').Router();
const database = require('./database');

router.post('/logs', async (req, res) => { // post new logs
	const logs = req.body.logs
	if (logs.length > 0) {
		logs.forEach((log) => { log.timestamp = new Date(log.timestamp); });
		try {
			database.get().collection('logs').insertMany(logs);
		} catch (err) {
			res.status(500).send(err);
		}
	}
	return res.send();
});

router.get('/logs', async (req, res) => { // get all logs
	database.get().collection("logs").find().toArray(function (error, results) {
		if (error) res.send(error);
		res.send(results);
	});
});

router.get('/alerts', async (req, res) => { // get all alerts
	database.get().collection("alerts").find().toArray(function (error, results) {
		if (error) res.send(error);
		res.send(results);
	});
});

router.get('/delete', async(req,res) => { // delete all logs
	database.get().collection('logs').deleteMany({});
	res.send('all logs removed')
});

router.get('/deletealerts', async(req,res) => { // delete all alerts
	database.get().collection('alerts').deleteMany({});
	res.send('all alerts removed')
});

module.exports = router;