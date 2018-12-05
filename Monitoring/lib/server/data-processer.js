/**
 * @author Sébastien Haentjens
 */

const database = require('./database');
const asyncForEach = require('../utils/asyncForEach');

const computeStatistics = async (logs, url) => { // computes max, avg and availability of websites
	if (logs.length > 0) {
		var available_logs_number = logs.filter(logs => logs.available).length;
		var availability = 1 - (logs.length - available_logs_number) / logs.length;
		var average_response_time = 0;
		logs.forEach((log) => average_response_time += parseInt(log.response_time));
		average_response_time = average_response_time / logs.length;
		var max_response_time = 0;
		logs.forEach((log) => {
			if (log.response_time > max_response_time) {
				max_response_time = log.response_time;
			}
		})
		statistics = {
			url: url,
			max: max_response_time,
			avg: average_response_time,
			availability: availability,
		};
		return statistics;
	}
	return {};
}

const getAlerts = async () => { // get alerts from the database
	var alerts = [];
	try {
		alerts = await database.get().collection('alerts').find().sort({
			timestamp: -1
		}).limit(20).toArray()
	} catch (err) {
		console.error("can not get alerts", err);
	}
	return alerts
}

const getWebsites = async (url_list) => { // get websites and their statistics
	var date = new Date();
	var statistics = [];
	var logs = [];
	await asyncForEach.asyncForEach(url_list, async function (index, url_list) {
		try {
			logs = await database.get().collection('logs').find({
				url: url_list[index],
				timestamp: { $gt: new Date(date.getTime() - 600000) }
			}).sort({
				timestamp: -1
			}).toArray();
		} catch (err) {
			console.error("can not get logs", err);
		}
		website_stats = await computeStatistics(logs, url_list[index]);
		updtateAlert(url_list[index], website_stats.availability);
		website_stats.timestamp = date;
		statistics.push(website_stats);
	});
	return statistics;
}

const getTenMinutes = async (url) => { // get last 10 minutes detailed statistics of the url's website
	var date = new Date();
	var logs = [];
	var splited_logs = [[], [], [], [], []];
	var detailed_statistics = [];
	try {
		logs = await database.get().collection('logs').find({
			url: url,
			timestamp: { $gt: new Date(date.getTime() - 600000) }
		}).sort({
			timestamp: -1
		}).toArray();
	} catch (err) {
		console.error("can not get logs", err)
	}
	var millis = [0, 120000, 240000, 360000, 480000]
	logs.forEach((log) => {
		if (log.timestamp > new Date(date.getTime() - millis[1])) {
			splited_logs[0].push(log);
		}
		if ((log.timestamp > new Date(date.getTime() - millis[2])) && (log.timestamp <= new Date(date.getTime() - millis[1]))) {
			splited_logs[1].push(log);
		}
		if ((log.timestamp > new Date(date.getTime() - millis[3])) && (log.timestamp <= new Date(date.getTime() - millis[1]))) {
			splited_logs[2].push(log);
		}
		if ((log.timestamp > new Date(date.getTime() - millis[4])) && (log.timestamp <= new Date(date.getTime() - millis[3]))) {
			splited_logs[3].push(log);
		}
		if (log.timestamp <= new Date(date.getTime() - millis[4])) {
			splited_logs[4].push(log);
		}
	});
	await asyncForEach.asyncForEach(splited_logs, async function (index, splited_logs) {
		stats = await computeStatistics(splited_logs[index], url);
		stats.timestamp = new Date(date - millis[index]);
		detailed_statistics.push(stats);
	});
	return detailed_statistics;
}

const getOneHour = async (url) => { // get last hour detailed statistics of the url's website
	var logs = [];
	var splited_logs = [[], [], [], [], [], []];
	var detailed_statistics = [];
	var date = new Date();
	try {
		logs = await database.get().collection('logs').find({
			url: url,
			timestamp: { $gt: new Date(date.getTime() - 3600000) }
		}).sort({
			timestamp: -1
		}).toArray();
	} catch (err) {
		console.error("can not get logs", err)
	}
	var millis = [0, 600000, 1200000, 1800000, 2400000, 3000000]
	logs.forEach((log) => {
		if (log.timestamp > new Date(date.getTime() - millis[1])) {
			splited_logs[0].push(log);
		}
		if ((log.timestamp > new Date(date.getTime() - millis[2])) && (log.timestamp <= new Date(date.getTime() - millis[1]))) {
			splited_logs[1].push(log);
		}
		if ((log.timestamp > new Date(date.getTime() - millis[3])) && (log.timestamp <= new Date(date.getTime() - millis[1]))) {
			splited_logs[2].push(log);
		}
		if ((log.timestamp > new Date(date.getTime() - millis[4])) && (log.timestamp <= new Date(date.getTime() - millis[3]))) {
			splited_logs[3].push(log);
		}
		if ((log.timestamp > new Date(date.getTime() - millis[5])) && (log.timestamp <= new Date(date.getTime() - millis[4]))) {
			splited_logs[4].push(log);
		}
		if (log.timestamp <= new Date(date.getTime() - millis[5])) {
			splited_logs[5].push(log);
		}
	});
	await asyncForEach.asyncForEach(splited_logs, async function (index, splited_logs) {
		stats = await computeStatistics(splited_logs[index], url);
		stats.timestamp = new Date(date - millis[index]);
		detailed_statistics.push(stats);
	});
	return detailed_statistics;
}

const updtateAlert = async (url, availability) => { // updates the alerts in the database
	date = new Date();
	alert = [];
	try {
		alert = await database.get().collection('alerts').find({
			url: url,
		}).sort({
			timestamp: -1
		}).limit(1).toArray();
	} catch (err) {
		console.error("can not get alerts", err);
	}
	if ((availability < 0.8) && ((!alert[0]) || (alert[0].availability > 0.8))) {
		try {
			database.get().collection('alerts').insert({
				url: url,
				type: "Lost",
				availability: availability,
				timestamp: date,
			});
		} catch (err) {
			console.error("can not send alert", err)
		}
	}
	if ((availability > 0.8) && ((!alert[0]) || (alert[0].availability < 0.8))) {
		try {
			database.get().collection('alerts').insert({
				url: url,
				type: "Recovered",
				availability: availability,
				timestamp: date,
			});
		} catch (err) {
			console.error("can not send alert", err)
		}
	}
}


module.exports = { getAlerts, getOneHour, getTenMinutes, getWebsites, updtateAlert };