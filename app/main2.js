window.onload = function() {
  var socket = io();
  var raceResults = {};
  // console.log("main.js ran");

  raceResults.rightLaneReactionTime = new JustGage({
    id: "rightLaneReactionTime",
    value: 0,
    decimals: 3,
    min: 0,
    max: .5,
    title: "Right Lane R/T",
    label: "Seconds",
    relativeGaugeSize: true,
  });

  raceResults.leftLaneReactionTime = new JustGage({
    id: "leftLaneReactionTime",
    value: 0,
    decimals: 3,
    min: 0,
    max: .5,
    title: "Left Lane R/T",
    label: "Seconds",
    relativeGaugeSize: true,
  });

  raceResults.rightLaneElapsedTime = new JustGage({
    id: "rightLaneElapsedTime",
    value: 0,
    decimals: 3,
    min: 0,
    max: 25,
    title: "Right Lane E/T",
    label: "Seconds",
    relativeGaugeSize: true,
  });

  raceResults.leftLaneElapsedTime = new JustGage({
    id: "leftLaneElapsedTime",
    value: 0,
    decimals: 3,
    min: 0,
    max: 25,
    title: "Left Lane E/T",
    label: "Seconds",
    relativeGaugeSize: true,
  });



  





  var displays = Object.keys(raceResults);


  socket.on("report", function (data) {
    console.log(data)
    displays.forEach(function (display) {
      raceResults[display].refresh(data[display]);
    });

  })

  // socket.on("winner", data => {
  //   console.log(data);
  // })


};
