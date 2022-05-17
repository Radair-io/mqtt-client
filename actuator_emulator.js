/** @format */

var mqtt = require('mqtt');

// Don't forget to update accessToken constant with your device access token
const thingsboardHost =
  'adb453e12ce8842efa6d93acfc032554-e358350541738a11.elb.us-east-1.amazonaws.com:1883';
const ACCESS_TOKEN = 'xS9s3haDoxRifsdZRAeE';

// Initialization of mqtt client using Thingsboard host and device access token
console.log(
  'Connecting to: %s using access token: %s',
  thingsboardHost,
  ACCESS_TOKEN
);
var client = mqtt.connect('mqtt://' + thingsboardHost, {
  username: ACCESS_TOKEN,
});
var switchFlag = { method: 'on', params: 0 };

//RPC message handling sent to the client
client.on('message', function (topic, message) {
  // console.log('request.topic: ' + topic);
  // console.log('request.body: ' + message.toString());
  var tmp = JSON.parse(message.toString());
  if (tmp.method == 'on') {
    switchFlag = tmp;
    // Uploads telemetry data using 'v1/devices/me/telemetry' MQTT topic
    client.publish(
      'v1/devices/me/telemetry',
      JSON.stringify({ switchFlag: 'Switch On', fanSpeed: 0 })
    );
    console.log(
      'response.message',
      JSON.stringify({
        switchFlag: 'Switch On',
        fanSpeed: 0,
        temperature: tmp.params,
      })
    );
  }
  if (tmp.method == 'off') {
    switchFlag = tmp;
    // Uploads telemetry data using 'v1/devices/me/telemetry' MQTT topic
    client.publish(
      'v1/devices/me/telemetry',
      JSON.stringify({
        switchFlag: 'Switch Off',
        fanSpeed: 0,
        temperature: tmp.params,
      })
    );
    console.log(
      'response.message',
      JSON.stringify({
        switchFlag: 'Switch Off',
        fanSpeed: 0,
        temperature: tmp.params,
      })
    );
  }
  if (tmp.method == 'speed') {
    let currTemp = tmp.params;
    let speed = 0;
    if (currTemp > 40 && currTemp <= 45) {
      speed = 1;
    } else if (currTemp > 45 && currTemp <= 50) {
      speed = 2;
    } else if (currTemp > 50 && currTemp <= 55) {
      speed = 3;
    } else {
      speed = 4;
    }
    client.publish(
      'v1/devices/me/telemetry',
      JSON.stringify({ switchFlag: 'Switch On', fanSpeed: speed })
    );
    console.log(
      'response.message',
      JSON.stringify({
        switchFlag: 'Switch On',
        fanSpeed: speed,
        temperature: tmp.params,
      })
    );
  }
  var requestId = topic.slice('v1/devices/me/rpc/request/'.length);
  //client acts as an echo service
  client.publish('v1/devices/me/rpc/response/' + requestId, message);
});

// Triggers when client is successfully connected to the Thingsboard server
client.on('connect', function () {
  console.log('Client connected!');
  client.subscribe('v1/devices/me/rpc/request/+');
  // Schedules telemetry data upload once per five second
  setInterval(publishTelemetry, 5000);
});

// Uploads telemetry data using 'v1/devices/me/telemetry' MQTT topic
function publishTelemetry() {
  // console.log('Sending: ' + JSON.stringify({ temperature: switchFlag.params }));
  client.publish(
    'v1/devices/me/telemetry',
    JSON.stringify({ temperature: switchFlag.params })
  );
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
