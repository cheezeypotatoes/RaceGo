
const http = require("http")
const os = require("os")
const path = require("path")
const av = require('tessel-av')
const MyEmitter = require("events")
const myEmitter = new MyEmitter();

const {Board, Servo, Leds, Buttons, Sensor} = require("johnny-five")
const Tessel = require("tessel-io")


const board = new Board({
  io: new Tessel()
});

const Express = require("express")
const SocketIO = require("socket.io")

const application = new Express()
const server = new http.Server(application)
const io = new SocketIO(server)
let camera = new av.Camera() // initiate webcam

//initiate express for the dashboard app
application.use(Express.static(path.join(__dirname, "/app")))
application.use("/vendor", Express.static(__dirname + "/node_modules/"))


application.get('/stream', (request, response) => {
response.redirect(camera.url)
})


board.on("ready", () => {
  let rightLaneIsRunning = false   //establish some global variables
  let leftLaneIsRunning = false
  let greenLightIsOn = false
  let rightLaneRedLightFoul = false
  let leftLaneRedLightFoul = false
  let rightLaneTripped = false
  let leftLaneTripped = false
  let greenLightOnTime = 0

  let raceResults = {
    rightLaneReactionTime: 0,
    leftLaneReactionTime: 0,
    rightLaneElapsedTime: 0,
    leftLaneElapsedTime: 0,
    raceWinner: "",
  }



  let buttons = new Buttons(["b7", "b6", "b4", "b5"])
   // buttons[0] the red button will stop/reset the timer
   // buttons[1] the green button will activate the start tree
   // buttons[2] the yellow button is for the right lane controller
   // buttons[3] the blue button is for the left lane controller

  let rightLaneFinishLine = new Sensor({ //IR receiver for right lane finish line
    pin: "b2",
    // freq: 40,
    threshold: 500
  })

  let leftLaneFinishLine = new Sensor({ //IR receiver for left lane finish line
  pin: "b3",
  // freq: 40,
  threshold: 500
  })


  let rightLaneServo = new Servo({
    controller: "PCA9685",
    port: "A",
    address: 0x73,
    pin: 14,
    range: [0, 180]
  })

  let leftLaneServo = new Servo({
    controller: "PCA9685",
    port: "A",
    address: 0x73,
    pin: 15,
    range: [0, 180]
  })

  let firstYellowLight = new Leds({
    controller: "PCA9685",
    port: "A",
    address: 0x73,
    pins: [2, 3],
  })

  let secondYellowLight = new Leds({
    controller: "PCA9685",
    port: "A",
    address: 0x73,
    pins: [4, 5],
  })

  let greenLight = new Leds({
    controller: "PCA9685",
    port: "A",
    address: 0x73,
    pins: [6, 7],
  })

  let redLight = new Leds({
    controller: "PCA9685",
    port: "A",
    address: 0x73,
    pins: [8, 9],
  })

  xMasTree = () => {
    firstYellowLight.off()
    secondYellowLight.off()
    greenLight.off()
    redLight.off()
    let startDelay = Math.random() // to vary interval between 2nd yellow and green leds

    setTimeout(() => {
      firstYellowLight.on() //first yellow light lit
    }, 1000)

    setTimeout(() => {
      secondYellowLight.on() //second yellow light lit
    }, 2500)

     setTimeout(() => {
      firstYellowLight.off()
      secondYellowLight.off()
      greenLight.on()
      greenLightIsOn = true
      greenLightOnTime = Date.now()
      // setTimeout(() => {
      //   greenLight.off()
      // },1000)
    }, 2800 + startDelay) // interval between 2nd yellow light and green light should vary



    //return
  } //*********************END OF xMasTree() FUNCTION***************************


  buttons[2].on("press", (rightLane) => { //right lane controller
    if (rightLaneIsRunning === true) { // disable controller when race is running
      console.log("race is running")
    } else {

          if (greenLightIsOn === false) { //determine if red light foul or start
            if (leftLaneRedLightFoul === true) { //in case of a double foul
              console.log("double foul left lane fouled first")
              return

            } else {
             rightLaneRedLightFoul = true
             console.log("Right Lane Red light DQ")
             console.log("Left Lane Wins!!")
             startRace(true, "rightLane") // sending to startRace() that foul occured

           }

          } else {
            startRace(false, "rightLane") // if no foul startRace() will open start gate
            rightLaneIsRunning = true          //and start timer()
        }
      }
  })


  buttons[3].on("press", (leftLane) => { //left lane controller
    if (leftLaneIsRunning === true) { // disable controller when race is running
      console.log("race is running")
    } else {

          if (greenLightIsOn === false) { //determine if red light foul or start
            if (rightLaneRedLightFoul === true) { //in case of a double foul
              console.log("double foul right lane fouled first")
              return

            } else {
             leftLaneRedLightFoul = true
             console.log("Left Lane Red light DQ")
             console.log("Right Lane Wins!!")
             startRace(true, "leftLane") // sending to startRace() that foul occured

            }

          } else {
            startRace(false, "leftLane") // if no foul startRace() will open start gate
            leftLaneIsRunning = true          //and start timer()
        }
      }
 })



  startRace = (foul, lane) => { //display if a foul occured in either lane

    if (foul === true) {
      console.log("dq " + lane)
      setTimeout(() => { //timeout to let the xMasTree timeouts finish
        if (lane === "rightLane") {
          // turn on right lane red light
          greenLight.off()
          redLight[0].on()
          greenLight[1].on()
        } else {
          // turn on left lane red light
          greenLight.off()
          redLight[1].on()
          greenLight[0].on()
        }
      }, 1400)
      return

    } else {  //if no foul start lane
      
      console.log(lane + " Will start")
    }

      if (lane === "rightLane") {
        rightLaneServo.to(90)
        rightLaneTimer()  //start timer for right lane
        raceResults.rightLaneReactionTime = (Date.now() - greenLightOnTime) /1000 //calculate r/t
        console.log(raceResults.rightLaneReactionTime)
        


      } else {

        leftLaneServo.to(180)
        //start timer for left lane
        leftLaneTimer()
        raceResults.leftLaneReactionTime = (Date.now() - greenLightOnTime) /1000 //calculate r/t
        console.log(raceResults.leftLaneReactionTime)
        
      }
   }

   rightLaneTimer = () => {
     let rightLaneStartTime = 0
     rightLaneStartTime = Date.now()
     const seconds = setInterval(() => {
       raceResults.rightLaneElapsedTime = (Date.now() - rightLaneStartTime) / 1000
     }, 10)

     rightLaneFinishLine.on("change", value => {    //when finish line is crossed
       
         clearInterval(seconds)
         rightLaneTripped = true
         if (leftLaneTripped === false) {
           console.log("Right Lane Wins")
           // additional code to indicate race winner
           greenLight.off()
           greenLight[0].on()
           redLight[1].on()
           raceResults.raceWinner = "Right Lane"
           
         } else {
            raceResults.raceWinner = "Left Lane"
            myEmitter.emit('race-complete', raceResults)
          }

         console.log(raceResults.rightLaneElapsedTime);
          return
      })
   }

  

   leftLaneTimer = () => {
     let leftLaneStartTime = 0
     leftLaneStartTime = Date.now()
     const seconds = setInterval(() => {
       raceResults.leftLaneElapsedTime = (Date.now() - leftLaneStartTime) / 1000
     }, 10)

     leftLaneFinishLine.on("change", value => {    //when finish line is crossed
       
         clearInterval(seconds)
         leftLaneTripped = true
         if (rightLaneTripped === false) {
           console.log("Left Lane Wins")
           // additional code to indicate race winner
           greenLight.off()
           greenLight[1].on()
           redLight[0].on()
           raceResults.raceWinner = "Left Lane"
           
          } else {
              raceResults.raceWinner = "Right Lane"
              myEmitter.emit('race-complete', raceResults)
            }

           console.log(raceResults.leftLaneElapsedTime);
            return
     })
   }




  reset = () => { // reset global variables for next race, run raceReady()
    leftLaneIsRunning = false
    rightLaneIsRunning = false
    greenLightIsOn = false
    rightLaneRedLightFoul = false
    leftLaneRedLightFoul = false
    rightLaneTripped = false
    leftLaneTripped = false
    greenLightOnTime = 0

    raceResults = {
      rightLaneReactionTime: 0,
      leftLaneReactionTime: 0,
      rightLaneElapsedTime: 0,
      leftLaneElapsedTime: 0,
      raceWinner: ""
      }

    rightLaneServo.to(180) //close start gate
    leftLaneServo.to(90) //close start gate
    
    raceReady()
  }

  raceReady = () => { //indicate ready for next race
    
    console.log("Race Ready")
    firstYellowLight.on()
    secondYellowLight.on()
    greenLight.on()
    redLight.on()
    
    

  }

  buttons[0].on("press", () => { // reset button
    reset()
  })

  buttons[1].on("press", () => { // if either lane has started, this button is disabled
    if (rightLaneIsRunning === true || leftLaneIsRunning === true) {
      console.log("race is running")
    } else
        xMasTree() // initiate the xmastree
  })

  raceReady()

  let clients = new Set()


  io.on("connection", socket => {
      if (clients.size < 5) {
      clients.add(socket);
      socket.on("disconnect", () => clients.delete(socket))
    }

    myEmitter.on('race-complete', (data) => {
      console.log(data)
      socket.emit("report" , data)
      clients.forEach(recipient => {
        recipient.emit("report", data)
      })
    
    });


    socket.on("message", message => {
      console.log(message)
  })

    socket.on("reset", message => {
        console.log("race app will reset")
    
        reset()
        
    })

    socket.on("tree", message => {
        console.log(message)
        xMasTree()
    })
  })

  let port = 3000;
  server.listen(port, () => {
    console.log(`http://${os.networkInterfaces().wlan0[0].address}:${port}`)
  })

  process.on("SIGINT", () => {
    server.close()
  })








})//****************************END OF BOARD.ON*********************************
