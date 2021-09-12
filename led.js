//this file was used to calibrate the finish line beams. freq, and threshold can be adjusted to fine tune the beam sensitivity

const {Board, Leds, Servo, Sensor} = require("johnny-five")
const Tessel = require("tessel-io")


const board = new Board({
  io: new Tessel()
});

board.on("ready", () => {


  let rightLaneFinishLine = new Sensor({ //IR receiver for right lane finish line
    pin: "b2",
    freq: 50,
    threshold: 500
  })

  let leftLaneFinishLine = new Sensor({ //IR receiver for left lane finish line
  pin: "b3",
  freq: 50,
  threshold: 500
  })


  // const sensorLeft = new Sensor("b3");

    // When the sensor value changes, log the value
    rightLaneFinishLine.on("change", value => {
      console.log("Right Lane: ");
      console.log("  value  : ", rightLaneFinishLine.value);
      console.log("-----------------");
    });


    // const sensorRight = new Sensor("b2");

      // When the sensor value changes, log the value
      leftLaneFinishLine.on("change", value => {
        console.log("Left Lane: ");
        console.log("  value  : ", leftLaneFinishLine.value);
        console.log("-----------------");
      });








})
