const database = require('../lib/server/database');
const dataprocesser = require('../lib/server/data-processer');
const wait = require('../lib/utils/wait');
var expect = require('chai').expect;


console.log("test");


describe('Testing alerting logic : lost', () => {
	before((done) => {
		database.connect(process.env.MONGO_URL || "mongodb://localhost:27017", async (err) => { // database initialization
			if (err) {
				console.error('Unable to connect to Mongo', err);
				process.exit(1);
			} else {
				await database.get().collection('alerts').deleteMany({});
				await database.get().collection('logs').deleteMany({});
				done();
			}
		});
	});


	before(async () => { // testing if no alerts in the database and availability is under 0.8
		try {
			await dataprocesser.updtateAlert("http://helloworld.com", 0.7);
			await wait.wait(100); // Necessary to wait before the next stop
		} catch (err) {
			console.error('Running updateAlert failed.', err);
			process.exit(1);
		}
	});

	it('The lost alert is in the database', async () => { // testing if the alert is in the database and has the right shape
		try {
			alertsArray = await database.get().collection('alerts').find({}).toArray()
		}
		catch {
			(err) => {
				console.error(err)
			}
		}
		expect(alertsArray).to.be.an('array');
		expect(alertsArray).to.have.lengthOf(1);
		expect(alertsArray[0]).to.have.property('url', 'http://helloworld.com');
		expect(alertsArray[0]).to.have.property('type', 'Lost');
		expect(alertsArray[0]).to.have.property('timestamp');
		expect(alertsArray[0]).to.have.property('availability', 0.7);
	});
});

describe('Testing alerting logic : recovered', () => {
	before(async () => { // testing if availability is over 0.8
		try {
			await dataprocesser.updtateAlert("http://helloworld.com", 0.9);
			await wait.wait(100); // Necessary to wait before the next stop
		} catch (err) {
			console.error('Running updateAlert failed.', err);
			process.exit(1);
		}
	});

	it('The recovered alert is in the database', async () => { // testing if the alert is in the database and has the right shape
		try {
			alertsArray = await database.get().collection('alerts').find({}).toArray()
		}
		catch {
			(err) => {
				console.error(err)
			}
		}
		expect(alertsArray).to.be.an('array');
		expect(alertsArray).to.have.lengthOf(2);
		expect(alertsArray[1]).to.have.property('url', 'http://helloworld.com');
		expect(alertsArray[1]).to.have.property('type', 'Recovered');
		expect(alertsArray[1]).to.have.property('timestamp');
		expect(alertsArray[1]).to.have.property('availability', 0.9);
	});
})