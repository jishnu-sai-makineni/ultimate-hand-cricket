import { useEffect, useState } from 'react'
import io from 'socket.io-client'
import {Alert} from 'react-bootstrap';
import * as gameTypesData from'../public/data/gameTypes.json'
import * as fs from 'fs'
import * as path from 'path'

export async function getServerSideProps(context) {
    let games = JSON.parse(fs.readFileSync(path.join(process.cwd(), '/public/data/games.json'), {encoding: 'utf8', flag: 'r'}))
    if(games[context.query.id]){
        context.query['gameType'] = games[context.query.id]["type"]
        return({props: context.query})
    }
    else{
        return {
            notFound: true
          }
    }
    // will be passed to the page component as props
}

export default function OnlineGame(props){

  function playTurn(number){
    socket.emit("playTurn", number);
}

function createAlert(message, type){
    let randKey = Math.random();
  alert = 
  <Alert key={randKey} variant={type} onClose={() => setAlerts(prevAlerts => prevAlerts.filter(alert => alert.key != randKey))} dismissible>
    <Alert.Heading>{message}</Alert.Heading>
  </Alert>
  setAlerts(alerts => [...alerts, alert])
  setTimeout(function(){
      try{
          setAlerts(prevAlerts => prevAlerts.filter(alert => alert.key != randKey))
        }
        catch{}
    }, 3000)
}


function clickedInputTile(number){
    setTheOnlyNumber(currentUserNumber)

    if(tossTime){
        socket.emit("toss", {status: "number", number: number});
    }
    else{
        resetGame()
        playTurn(number);
        console.log("yeah")
    }
    // document.getElementById('currentUserNumber').innerHTML = number;
}

function joinGame(number){
    if(number.length == 4 && number.match(/^[0-9]+$/)){
        socket.emit("joinGame", number);
    }
    else{
        createAlert("Please enter a valid ID Number", "warning")
    }
}

function copyButton(e){
    try{
        document.getElementById('invite-link').select();
        document.execCommand('copy');
    }
    catch{
        navigator.clipboard.writeText(currentUrl)
        .then(() => {})
        .catch(() => {})
    }
}

function resetGame(){
  setCurrentUserNumber(null)
  setOpponentUserNumber(null)
}


let [idNumber, setIdNumber] = useState('')
let [tossTime, setTossTime] = useState(false)
let [opponentUserNumber, setOpponentUserNumber] = useState('')
let [currentUserNumber, setCurrentUserNumber] = useState('')
let [currentScore, setCurrentScore] = useState(null)
let [targetScore, setTargetScore] = useState(null)
let [tempId, setTempId] = useState(null)
let [inningsStatus, setInningsStatus] = useState(null)
let [theOnlyNumber, setTheOnlyNumber] = useState(null)
let [socket, setSocket] = useState(null)
let [alerts, setAlerts] = useState([])

let currentUrl = ''
if (typeof window !== "undefined") {
    currentUrl = window.location.protocol + '//' + window.location.host + "/onlinegame?id=" + props.id
}

useEffect(() => {
    if(socket){
        createAlert("waiting for opponent")
        socket.emit('joinRoom', {id: props.id, idNumber: idNumber})
    }
}, [socket])

  useEffect(() => {
    let socket
    fetch('/api/socketio').finally(() => {
      socket = io()
      setSocket(socket)
    })
    return () => {socket.close()}
  }, [setSocket]) // Added [] as useEffect filter so it will be executed only once, when component is mounted
  
  useEffect(() => {
  if(socket){
    socket.on('idNumber', function(_idNumber){
        setIdNumber(_idNumber)
    });

    socket.on('joinRoom', data => {
        if(data.status == 'error'){
            createAlert(data.message, "danger")
        }
        else if(data.status == 'full'){
            createAlert("The room is full", "danger")
            setTimeout(() => {
                window.location.replace('/')
            }, 1000)
        }
        else if(data.status == 'success'){
            createAlert("game joined", "success")
            setTempId(data.match.id1 == idNumber ? "id1" : "id2")
            console.log(idNumber)
            setTossTime(true)
            setCurrentScore(data.match.currentScore)
            setTargetScore(data.match.targetScore)

            resetGame() // stamp of approval
        }
    })

    //   socket.on('joinGame', data => {
    //       if(data.status == 'error'){
    //           createAlert("An error occured", "danger")
    //       }
    //       else if(data.status == 'success'){
    //           setTempId(data.match.id1 == idNumber ? "id1" : "id2")
    //           console.log(idNumber)
    //           setTossTime(true)
    //           setCurrentScore(data.match.currentScore)
    //           setTargetScore(data.match.targetScore)
    //           // document.getElementById('inningsStatus').innerHTML = match.inningsInfo[tempID] == "bat" ? "You are batting" : "You are bowling";
    //           // match.inningsInfo[tempID] == "bat" ? document.getElementById('userImage').src = "/cricket-bat.svg" : document.getElementById('userImage').src = "/cricket-ball.svg";
    //           // match.inningsInfo[tempID] == "bat" ? document.getElementById('opponentImage').src = "/cricket-ball.svg" : document.getElementById('opponentImage').src = "/cricket-bat.svg";
    //           resetGame() // stamp of approval
    //       }
    //   })

      socket.on('playTurn', data => {
          if(data.status == "successToSender"){
            setCurrentUserNumber(data.numberGiven)
          }

          if(data.status == "success"){
              let match = data.match;
              setCurrentScore(match.currentScore)
              setTargetScore(match.targetScore)
              setInningsStatus(match.inningsInfo[tempId] == "bat" ? "You are batting" : "You are bowling")
              setOpponentUserNumber(match.numberPlayed[tempId == "id1" ? "id2" : "id1"])
              if(match.numberPlayed["id1"] == match.numberPlayed["id2"]){
                  createAlert("Out!", "danger")
              }
          }
          if(data.status == "error"){
              createAlert("It's not your turn yet!", "info")
              console.log(theOnlyNumber)
              setCurrentUserNumber(theOnlyNumber)
          }
      })

      socket.on('toss', data =>{
          if(data.status == "error"){
              createAlert("An error occured", "danger")
          }
          else if(data.status == "successToSender"){
            setCurrentUserNumber(data.numberGiven)
          }
          else if(data.status == "tossChoiceDecided"){
              document.getElementById('oddOReven').style.display = "none";
              setInningsStatus(data.choice[tempId] === "odd" ? "You chose odd" : "You chose even")
          }
          else if(data.status == "number"){
              setCurrentUserNumber(data[tempId])
              setOpponentUserNumber(data[tempId == "id1" ? "id2" : "id1"])
          }
          else if(data.status == "tossWon"){
              data.winner == tempId? setInningsStatus('You won the toss') : setInningsStatus('You lost the toss')
              document.getElementById('oddOReven').style.display = "none";
              
              data.winner == tempId? document.getElementById('batORbowl').style.display = "block" : null
          }
          else if(data.status == "inningsChosen"){
              data.choice == "bat" ? setInningsStatus("You are batting") : setInningsStatus("You are bowling")
              document.getElementById('batORbowl').style.display = "none";
              setTossTime(false)
              resetGame()
          }
      })

      socket.on('opponentDisconnected', data => {
          createAlert("Your opponent has disconnected", "danger")
          setOpponentUserNumber('Opponent Disconnected')
          setTimeout(resetGame, 2000)
      })

      socket.on('newGame', data =>{
          if(data.match.winner == tempId){
              createAlert("You won the game!", "success")
          }
          else if(data.match.winner == "draw"){
              createAlert("It's a draw!", "info")
          }
          else{
              createAlert("You lost the game!", "danger")
          }
          // document.getElementById('inningsStatus').innerHTML = match.inningsInfo[tempID] == "bat" ? "You are batting" : "You are bowling";
          document.getElementById('oddOReven').style.display = "block";
          setTossTime(true)
          setCurrentScore(0)
          setTargetScore(null)
          setInningsStatus("")
          setOpponentUserNumber(data.match.numberPlayed[tempId == "id1" ? "id2" : "id1"])
          setTimeout(resetGame, 2000)
      })

    function resetGame(){
      setCurrentUserNumber(null)
      setOpponentUserNumber(null)
    }
    return( () => {
        socket.removeAllListeners()
    })
  }
  })

  function range(size, startAt = 0) {
    return [...Array(size).keys()].map(i => i + startAt);
  }
  return(
    <div id="main">
    <h1>Invite Link : <input id="invite-link" value={currentUrl} readOnly/><button id="copy" onClick={copyButton}>Copy</button></h1>

    {/* <button onClick={() => window.location.href = '/logout'} className="btn btn-danger" style={{position: "fixed", right: "15px", top: "15px"}}>Logout</button> */}

    <div id="game-content">
        <div id="game-details">
            Current score: <span id="currentScore">{currentScore}</span>
            <br />
            Target score: <span id="targetScore">{targetScore}</span>
            <br />
            <span id="inningsStatus">{inningsStatus}</span>
        </div>
        <div id="oddOReven">
            <button className='btn btn-outline-dark' onClick={() => socket.emit('toss', {status: 'choice', choice: 'odd'})}>ODD</button>
            <button className='btn btn-outline-dark' onClick={() => socket.emit('toss', {status: 'choice', choice: 'even'})}>EVEN</button>
        </div>
        <div id="batORbowl" style={{display: "None"}}>
            <button className='btn btn-outline-dark' onClick={ () => socket.emit('toss', {status: 'inningsChoice', choice: 'bat'})}>BAT</button>
            <button className='btn btn-outline-dark' onClick={ () => socket.emit('toss', {status: 'inningsChoice', choice: 'bowl'})}>BOWL</button>
        </div>
        <div id="input-tiles-div">
            {gameTypesData[props.gameType].map(number =>
            <button key={number} className="input-tile" onClick={() => clickedInputTile(number)}>{number}</button>)}
            {/* {[1,2,3,4,5,6].map(number =>
            <button key={number} className="input-tile" onClick={() => clickedInputTile(number)}>{number}</button>)} */}
        </div>
        
        <div>
            <div className="number-div">
                <img className="statusImage" id="userImage" src={inningsStatus == "You are batting"?'cricket-bat.svg':'cricket-ball.svg'}></img>
                <div id="currentUser" className="score-group">
                    Your number:
                    <h2 id="currentUserNumber">{currentUserNumber}</h2>
                </div>
            </div>

            <div className='number-div'>
                <img className="statusImage" id="opponentImage" src={inningsStatus != "You are batting"?'cricket-bat.svg':'cricket-ball.svg'}></img>
                <div id="opponentUser" className="score-group">
                    Opponent{"'"}s number:
                    <h2 id="opponentUserNumber">{opponentUserNumber}</h2>
                </div>
            </div>
        </div>
    </div>
    <div id="alerts">
      {alerts}
    </div>
    {/* <div id="joinGameDiv">
        Enter id number:
        <input id="joinGame" type="text" pattern="\d{4}" maxLength="4" className="idNumberStyle"></input>
        <button id="joinGameBtn" onClick={ () => joinGame(document.getElementById('joinGame').value)}>Join</button>
    </div> */}
    </div>
  )
}
