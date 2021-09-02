var socket = io();
var results = {}


    // grab R/T DOM divs
    let rightLaneRT = document.getElementById("right-lane-RT")
    let rightLaneRTstatus = document.querySelector(".right-lane-RT")
    let leftLaneRT = document.getElementById("left-lane-RT")
    let leftLaneRTstatus = document.querySelector(".left-lane-RT")
    // grab E/T DOM divs
    let rightLaneET = document.getElementById("right-lane-ET")
    let rightLaneETstatus = document.querySelector(".right-lane-ET")
    let leftLaneET = document.getElementById("left-lane-ET")
    let leftLaneETstatus = document.querySelector(".left-lane-ET")

    let resetBtn = document.querySelector(".reset-btn")
    let treeBtn = document.querySelector(".tree-btn")

    rightLaneRTstatus.style.background = "white"
    leftLaneRTstatus.style.background = "white"
    rightLaneRTstatus.style.color = "black"
    leftLaneRTstatus.style.color = "black"
    rightLaneETstatus.style.background = "white"
    leftLaneETstatus.style.background = "white"
    rightLaneETstatus.style.color = "black"
    leftLaneETstatus.style.color = "black"



    socket.on("report", data => {
        console.log(data);
        results = data
        // insert race results
        rightLaneRT.innerHTML = data.rightLaneReactionTime
        rightLaneRTstatus.textContent = "Right Lane R/T"
        leftLaneRT.innerHTML = data.leftLaneReactionTime
        leftLaneRTstatus.textContent = "Left Lane R/T"
        rightLaneET.innerHTML = data.rightLaneElapsedTime
        rightLaneETstatus.textContent = "Right Lane E/T"
        leftLaneET.innerHTML = data.leftLaneElapsedTime
        leftLaneETstatus.textContent = "Left Lane E/T"

        // insert styling
        rightLaneRT.style.cssText = "font-size: 45px; border: 1px black solid;"
        leftLaneRT.style.cssText = "font-size: 45px; border: 1px black solid;"
        rightLaneET.style.cssText = "font-size: 45px; border: 1px black solid;"
        leftLaneET.style.cssText = "font-size: 45px; border: 1px black solid;"


        
        // determine holeshot 
        if(data.rightLaneReactionTime < data.leftLaneReactionTime) {
            rightLaneRTstatus.style.background = "green"
            leftLaneRTstatus.style.background = "red"
            rightLaneRTstatus.style.color = "white"
            leftLaneRTstatus.style.color = "white"

        } 

        if(data.leftLaneReactionTime < data.rightLaneReactionTime) {
            rightLaneRTstatus.style.background = "red"
            leftLaneRTstatus.style.background = "green"
            rightLaneRTstatus.style.color = "white"
            leftLaneRTstatus.style.color = "white" 
        }


        //indicate winner
        if(data.raceWinner === "Right Lane") {
            rightLaneETstatus.style.background = "green"
            leftLaneETstatus.style.background = "red"
            rightLaneETstatus.style.color = "white"
            leftLaneETstatus.style.color = "white"
        } else {
            rightLaneETstatus.style.background = "red"
            leftLaneETstatus.style.background = "green"
            rightLaneETstatus.style.color = "white"
            leftLaneETstatus.style.color = "white"
        }
    })

    

    reset = () => {
        results.winner = ""
        results.rightLaneRT = "0.000"
        results.leftLaneRT = "0.000"
        results.rightLaneET = "0.000"
        results.leftLaneET = "0.000"
        rightLaneRT.innerHTML = results.rightLaneRT
        rightLaneRTstatus.textContent = "Right Lane R/T"
        leftLaneRT.innerHTML = results.leftLaneRT
        leftLaneRTstatus.textContent = "Left Lane R/T"
        rightLaneET.innerHTML = results.rightLaneET
        rightLaneETstatus.textContent = "Right Lane E/T"
        leftLaneET.innerHTML = results.leftLaneET
        leftLaneETstatus.textContent = "Left Lane E/T"
        rightLaneRTstatus.style.background = "white"
        leftLaneRTstatus.style.background = "white"
        rightLaneRTstatus.style.color = "black"
        leftLaneRTstatus.style.color = "black"
        rightLaneETstatus.style.background = "white"
        leftLaneETstatus.style.background = "white"
        rightLaneETstatus.style.color = "black"
        leftLaneETstatus.style.color = "black"
        socket.emit("reset", "reset app")
        location.reload()
        
    
    }

    tree = () => {
        console.log("tree")
        socket.emit("tree", "tree will start")
        location.reload()
    }



socket.on("message", message => {
    console.log(message);
    
})




socket.on("refresh", message => {
    console.log(message)
    location.reload()
})