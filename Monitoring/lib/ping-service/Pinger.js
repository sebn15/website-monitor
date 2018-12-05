const chalk = require('chalk');
require('dotenv').load();
const axios = require('axios');

class Pinger {

	constructor(url, interval) {
		this.url = url;
		this.interval = interval;
		this.intervalObject;
		this.sendLogsIntervalObject;
		this.logs = [];
	}

	async singleCheck() { // check one website once
		let response_time;
		let start = new Date();
		try {
			const request = await axios.get(this.url);
			const stop = new Date();
			response_time = stop.getTime() - start.getTime();
			return this.logs.push({
				url: this.url, response_time, available: 1, timestamp: stop,
			});
		} catch (err) {
			const stop = new Date();
			response_time = stop.getTime() - start.getTime();
			if (err.response) {
			}
			return this.logs.push({
				url: this.url, response_time, available: 0, timestamp: stop,
			});
		}
	}

	async start() { // start check every interval
		this.intervalObject = setInterval(() => this.singleCheck(), this.interval);
		this.sendLogsIntervalObject = setInterval(() => this.sendAndDeleteLogs(), 5000)
	}

	async sendAndDeleteLogs() { 
		this.sendLogs(this.logs);
		this.logs = [];
	}

	async sendLogs(logs) { // send all logs
		try {
			return await axios.post("http://localhost:" + process.env.PORT + "/logs", { logs: logs });
		} catch (err) {
			console.error(chalk.red('The server is unreachable'));
			return process.exit(1);
		}
	}

}

module.exports = { Pinger }