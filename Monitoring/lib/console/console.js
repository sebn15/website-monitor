/**
 * @author Sébastien Haentjens
 */

const blessed = require('blessed');
const contrib = require('blessed-contrib');
const console_service = require('./console-service');
const screen = blessed.screen();

const start = (url_list) => { // start to display on console
	var screens = url_list.map((url) => async function (screen) { // create one page for each website
		var grid = new contrib.grid({ rows: 24, cols: 24, screen: screen });
		var widgets = initialize(screen, grid, url); // console initialization
		firstView(url, url_list, widgets); // get and display data once
		setInterval(async () => { // get and display data every 10s
			websites = await console_service.getWebsites(url_list);
			alerts = await console_service.getAlerts();
			ten_minutes = await console_service.getTenMinutes(url);
			widgets.websites_table.setData({
				headers: ['URL', 'MAX', 'AVG', 'DATE'],
				data: websites
			});
			widgets.alerts_table.setData({
				headers: ['URL', 'TYPE', 'AVAIL', 'DATE'],
				data: alerts
			});
			widgets.availability_ten_minutes.setData({
				titles: ten_minutes.time,
				data: ten_minutes.availability
			});
			widgets.max_ten_minutes.setData({
				titles: ten_minutes.time,
				data: ten_minutes.max,
			});
			widgets.avg_ten_minutes.setData({
				titles: ten_minutes.time,
				data: ten_minutes.avg,
			});
		}, 10000);
		setInterval(async () => {
			one_hour = await console_service.getOneHour(url);
			widgets.availability_one_hour.setData({
				titles: one_hour.time,
				data: one_hour.availability
			});
			widgets.max_one_hour.setData({
				titles: one_hour.time,
				data: one_hour.max,
			});
			widgets.avg_one_hour.setData({
				titles: one_hour.time,
				data: one_hour.avg,
			});
		}, 60000);
		screen.key(['escape', 'q', 'C-c'], () => process.exit(0));
	});
	const carousel = new contrib.carousel(screens, { // initialize the carousel
		screen: screen,
		interval: 0,
		controlKeys: true
	});
	carousel.start();
	setInterval(() => { // refresh the view every 500 ms
		screen.render();
	}, 500);
}

const firstView = async (url, url_list, widgets) => {
	websites = await console_service.getWebsites(url_list);
	alerts = await console_service.getAlerts();
	ten_minutes = await console_service.getTenMinutes(url);
	one_hour = await console_service.getOneHour(url);
	widgets.websites_table.setData({
		headers: ['URL', 'MAX', 'AVG', 'DATE'],
		data: websites
	});
	widgets.alerts_table.setData({
		headers: ['URL', 'TYPE', 'AVAIL', 'DATE'],
		data: alerts
	});
	widgets.availability_ten_minutes.setData({
		titles: ten_minutes.time,
		data: ten_minutes.availability
	});
	widgets.max_ten_minutes.setData({
		titles: ten_minutes.time,
		data: ten_minutes.max,
	});
	widgets.avg_ten_minutes.setData({
		titles: ten_minutes.time,
		data: ten_minutes.avg,
	});
	widgets.availability_one_hour.setData({
		titles: one_hour.time,
		data: one_hour.availability
	});
	widgets.max_one_hour.setData({
		titles: one_hour.time,
		data: one_hour.max,
	});
	widgets.avg_one_hour.setData({
		titles: one_hour.time,
		data: one_hour.avg,
	});
}

const initialize = (screen, grid, url) => { // draw all boxes in the console
	var ten_minutes = grid.set(2, 10, 11, 14, blessed.box, {
		label: "Ten minutes",
	});
	var one_hour = grid.set(13, 10, 11, 14, blessed.box, {
		header: "One hour",
	});
	var header = grid.set(0, 10, 2, 14, blessed.box,
		{
			align: 'center'
			, content: url
		});
	var websites_table = grid.set(0, 0, 12, 10, contrib.table,
		{
			label: "Monitored websites"
			, keys: true
			, fg: 'white'
			, selectedFg: 'white'
			, selectedBg: 'blue'
			, interactive: true
			, width: '100%'
			, height: '100%'
			, border: { type: "line", fg: "cyan" }
			, columnWidth: [15, 5, 5, 15]
		});
	var alerts_table = grid.set(12, 0, 12, 10, contrib.table,
		{
			label: "Alerts"
			, fg: 'white'
			, selectedFg: 'white'
			, width: '100%'
			, height: '100%'
			, border: { type: "line", fg: "cyan" }
			, columnWidth: [15, 5, 5, 15]
		});
	var availability_ten_minutes = grid.set(3, 11, 3, 12, contrib.bar,
		{
			label: 'Availability'
			, barWidth: 5
			, barSpacing: 12
			, xOffset: 0
			, maxHeight: 1
		});
	var max_ten_minutes = grid.set(6, 11, 3, 12, contrib.bar,
		{
			label: 'Max response time'
			, barWidth: 5
			, barSpacing: 12
			, xOffset: 0
			, maxHeight: 1
		});
	var avg_ten_minutes = grid.set(9, 11, 3, 12, contrib.bar,
		{
			label: 'Avg response time'
			, barWidth: 5
			, barSpacing: 12
			, xOffset: 0
			, maxHeight: 1
		});
	var availability_one_hour = grid.set(14, 11, 3, 12, contrib.bar,
		{
			label: 'Availability'
			, barWidth: 5
			, barSpacing: 12
			, xOffset: 0
			, maxHeight: 1
		});
	var max_one_hour = grid.set(17, 11, 3, 12, contrib.bar,
		{
			label: 'Max response time'
			, barWidth: 5
			, barSpacing: 12
			, xOffset: 0
			, maxHeight: 1
		});
	var avg_one_hour = grid.set(20, 11, 3, 12, contrib.bar,
		{
			label: 'Avg response time'
			, barWidth: 5
			, barSpacing: 12
			, xOffset: 0
			, maxHeight: 1
		});
	screen.append(ten_minutes);
	screen.append(one_hour);
	screen.append(header);
	screen.append(websites_table);
	screen.append(alerts_table);
	screen.append(availability_ten_minutes);
	screen.append(max_ten_minutes);
	screen.append(avg_ten_minutes);
	screen.append(availability_one_hour);
	screen.append(max_one_hour);
	screen.append(avg_one_hour);
	return { websites_table, alerts_table, availability_ten_minutes, max_ten_minutes, avg_ten_minutes, availability_one_hour, max_one_hour, avg_one_hour };
}

module.exports = { start };