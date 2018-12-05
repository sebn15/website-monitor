# Website monitor

This is a website monitor. It pings a list of websites and displays performance and availability of response time on a console.<br/>
![dashboard](doc/dashboard.png?raw=true "Dashboard view") <br/>
It was developped on with Node.js/Express, using a Mongo database.

https://github.com/sebn15/Monitor

## Setup
```
$ npm install
```
This will install all the node modules needed for the app. Make sure you installed Node to run npm commands.

## Start 

In a firt console, run :

```
$ mongod
```
This should run the database and open it on port 27017 by default. If not, you can change the adress with a .env file. Make sure you installed MongoDB to run mongod.<br/>
Then, on a second console, run :
```
$ npm start
```
This should run the monitor in the development mode. In the same console will appear in few seconds all the metrics.

## Structure

The Monitor has 4 components : server, database, pinger and console. The server is the only component that communicates with the other.

      +-------------------+        +-------------------+
      |                   |        |                   |
      |       Pinger      |        |      Console      |
      |                   |        |                   |
      +---+---------------+        +-------------+-----+
          |                                      ^
          |                                      |             
          |                                      |
          |      +------------------------+      |
          |      |                        |      |
          +----> |         Server         | -----+
                 |                        |
                 |                        |
                 +------------------------+
                            | ^
                            | |
                            | |
                            | |
                            v |
                    +------------------+
                    |                  |
                    |     Database     |
                    |                  |
                    +------------------+ 

### Pinger

This component's role is to pig a website and return the response time regularly to the server. It is composed of a class : Pinger. For each website, we create a new instance of Pinger (with an URL and an interval), then we start it with the start() method. In order to avoid to call the server too often, each pinger object send all data gathered every 5s. This component has been made to be able to run without a server. Once the start() method is called, it just posts logs to http://server_adress/logs

### Database

The database has two collections : logs and alerts. The logs collection contains every ping of the last hour that any pinger has done. It has a response time, an URL and a timestamp. The alerts collection contains every alerts of the last 24 hours. There are two types of alert : "Lost" when the website's availability decreased under 80% and "Recovered" when it increased over 80%.

### Console

The console displays five elements : <br/>
 - The list of the monitored websites and their last 10 minutes statistics<br/>
 - The list of the alerts<br/>
 - The URL of a monitored website<br/>
 - The last 10 minutes detailed statisctics of the website<br/>
 - The last hour detailed statisctics of the websit<br/><br/>

Each element is updates his data every 10s exept the statistics of last hour whis is updated every minute. The view is updated twice a second.<br/><br/>
Each time an element has to update his data, it calls the console-service, which role is to get the data from the server and format it for the console. This component needs the server running to work since it needs to gather data that are processed by the server.

### Server

The server is the link between the other components : <br/>
 - It receives logs from each pinger and send it to the database. Because the server and each pinger are made to be independant, the server gets the logs by his URL.
 - It updates the alerts on the database.
 - It gets and processes data for the console-service by calling the database.

## Test

To run tests, run :
```
$ npm test
```
The test only tests the alerting logic for now. The test is composed of two unit test : <br/>
 - One that tests the alerting logic if the alert collection is empty and the availability under 0.8.
 - One that tests the alerting logic if the alert collection is not emplty and the availability over 0.8. <br/>
 ![test](doc/test.png?raw=true "Test result") 

## Feedback

This exercise was very interesting to do since you need to do various tasks. You need to create data, store it, process it, and then display it. So you have to think of a strong code architecture to be sure each data follows the right pipeline. But the most difficult part is that all of this has to be made asynchronous. You need to spend a lot of time to make sure that the commands are executed in the right order. This was for me the real challenge, and i learned a lot about async functions and await. Asynchrony is however well handled by JavaScript, and also well documented.

## Improvements

This monitor can be improved in many ways. One of them would be the design. The console dashboard is indeed not very eye catching. To improve it you could design a web-app displaying a more complete dashboard, using sockets to have real time alerting. This would need a few changes in the server, but not a lot. The biggest part would be to developp the web-app.