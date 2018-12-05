/**
 * @author Sébastien Haentjens
 */

const dataprocesser = require('../server/data-processer');

const getWebsites = async (url_list) => { // return websites statistics in good format
	var websites = [];
	websites = await dataprocesser.getWebsites(url_list);
	websites = websites.map((website_stat) => [formatURL(website_stat.url), format(website_stat.max).slice(0, 5), format(website_stat.avg).slice(0, 5), formatDate(website_stat.timestamp)]);
	return websites;
}

const getAlerts = async () => { // return alerts in good format
	var alerts = [];
	alerts = await dataprocesser.getAlerts();
	alerts = alerts.map((alert) => [formatURL(alert.url), format(alert.type).slice(0, 5), format(alert.availability).slice(0, 5), formatDate(alert.timestamp)]);
	return alerts;
}

const getTenMinutes = async (url) => { // return the last 10 minutes detailed statistics of the website's url
	statistics = await dataprocesser.getTenMinutes(url);
	var formated_stats = { availability: [], max: [], avg: [], time: [] };
	statistics.forEach((stat) => {
		formated_stats.availability.push(format(stat.availability).slice(0, 5));
		formated_stats.max.push(format(stat.max).slice(0, 5));
		formated_stats.avg.push(format(stat.avg).slice(0, 5));
		formated_stats.time.push(formatDate(stat.timestamp));
	});
	return formated_stats;
}

const getOneHour = async (url) => { // return the last hour detailed statistics of the website's url
	statistics = await dataprocesser.getOneHour(url);
	var formated_stats = { availability: [], max: [], avg: [], time: [] };
	statistics.forEach((stat) => {
		formated_stats.availability.push(format(stat.availability).slice(0, 5));
		formated_stats.max.push(format(stat.max).slice(0, 5));
		formated_stats.avg.push(format(stat.avg).slice(0, 5));
		formated_stats.time.push(formatDate(stat.timestamp));
	});
	return formated_stats;
}

function format(data) { // undifined data processing
	try {
		return data.toString();
	} catch (err) {
		return ("???")
	}
}

function formatURL(url) { // url processing
	try {
		return url.toString().slice(12, 27);
	} catch (err) {
		return ("???")
	}
}

function formatDate(date) { // date processing
	try {
		return date.toString().split(' ')[4];
	} catch (err) {
		return ("???")
	}
}

module.exports = { getTenMinutes, getOneHour, getAlerts, getWebsites };