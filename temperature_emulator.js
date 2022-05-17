/** @format */

var mqtt = require('mqtt');

// Don't forget to update accessToken constant with your device access token
const thingsboardHost =
  'adb453e12ce8842efa6d93acfc032554-e358350541738a11.elb.us-east-1.amazonaws.com:1883';
const ACCESS_TOKEN = 'IaV1dAHJd7HVS7DnqozI';
const mqttTopic = 'v1/devices/me/telemetry';
const temperatureArray = [10, 18, 38, 45, 53, 57, 25];
let j = 0;
// Initialization of mqtt client using Thingsboard host and device access token
console.log(
  'Connecting to: %s using access token: %s',
  thingsboardHost,
  ACCESS_TOKEN
);
var client = mqtt.connect('mqtt://' + thingsboardHost, {
  username: ACCESS_TOKEN,
});

const createMessage = (temp) => ({
  temperature: temp,
});

// Triggers when client is successfully connected to the Thingsboard server
client.on('connect', function () {
  console.log('Client connected!');
  setInterval(publishTelemetry, 5000);
});

// Uploads telemetry data using 'v1/devices/me/telemetry' MQTT topic
function publishTelemetry() {
  if (j < temperatureArray.length) {
    var msg = createMessage(temperatureArray[j]);
    client.publish(mqttTopic, JSON.stringify(msg));
    console.log(msg);
    j++;
  } else {
    client.end();
  }
}

//Catches ctrl+c event
process.on('SIGINT', function () {
  console.log();
  console.log('Disconnecting...');
  client.end();
  console.log('Exited!');
  process.exit(2);
});

//Catches uncaught exceptions
process.on('uncaughtException', function (e) {
  console.log('Uncaught Exception...');
  console.log(e.stack);
  process.exit(99);
});
