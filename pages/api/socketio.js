import { Server } from 'socket.io'
import * as fs from 'fs'
import * as path from 'path'

const ioHandler = (req, res) => {
  let users = {};
  let matches = [];
  if (!res.socket.server.io) {
    console.log('*First use, starting socket.io')
    
    const io = new Server(res.socket.server)
    io.on('connection', (socket) => {
      
      //a random 4 digit number
      while(true){
        var idNumber = Math.floor(1000 + Math.random() * 9000);
        if(!users[idNumber]){
          break;
        }
      }
      
      socket.emit('idNumber', idNumber);
      users[idNumber] = socket;
      
      socket.on('joinRoom', (data) => {
        let id = data.id
        let games = JSON.parse(fs.readFileSync(path.join(process.cwd(), '/public/data/games.json'), {encoding: 'utf8', flag: 'r'}))
        
        if(games[id]){
          socket.join(id)
          if(io.sockets.adapter.rooms.get(id).size > 2){
            socket.emit('joinRoom', {status: "full"});
            socket.leave(id)
            return;
          }

          if(io.sockets.adapter.rooms.get(id).size == 1){
            games[id] = {...games[id], id1: idNumber}
            fs.writeFileSync(path.join(process.cwd(), '/public/data/games.json'), JSON.stringify(games));
          }

          else if(io.sockets.adapter.rooms.get(id).size == 2){
            games[id] = {...games[id], id2: idNumber}
            fs.writeFileSync(path.join(process.cwd(), '/public/data/games.json'), JSON.stringify(games));
            let matchInfo = {
              id1: games[id].id1,
              id2: idNumber,
              currentScore: 0,
              targetScore: null,
              winner: null,
              // turn: {id1: true, id2: true},
              tossPlayed: false,
              tossInningsChosen: false,
              tossNumbers: {id1: null, id2: null},
              tossChoice: {id1: null, id2: null},
              tossWinner: null,
              turn: {id1: true, id2: true},
              numberPlayed: {id1: null, id2: null},
              inningsInfo: {id1: "bat", id2: "bowl"},
              innings: 1
            }
            matches.push(matchInfo);

            users[games[id].id1].emit('joinRoom', {status: "success", id: idNumber, match: matchInfo});
            socket.emit('joinRoom', {status: "success", id: games[id].id1, match: matchInfo});
          }
        }
      })


      
      socket.on('joinGame', number => {
          if(users[number]){
            let matchInfo = {
              id1: idNumber,
              id2: number,
              currentScore: 0,
              targetScore: null,
              winner: null,
              // turn: {id1: true, id2: true},
              tossPlayed: false,
              tossInningsChosen: false,
              tossNumbers: {id1: null, id2: null},
              tossChoice: {id1: null, id2: null},
              tossWinner: null,
              turn: {id1: true, id2: true},
              numberPlayed: {id1: null, id2: null},
              inningsInfo: {id1: "bat", id2: "bowl"},
              innings: 1
            }
            matches.push(matchInfo);
  
            users[number].emit('joinGame', {status: "success", id: idNumber, match: matchInfo});
            socket.emit('joinGame', {status: "success", id: number, match: matchInfo});
          }
          else{
              socket.emit('joinGame', {status: "error"});
          }
      })
  
      socket.on('toss', data => {
        if(matches.length > 0){
          let match = matches.find(match => match.id1 == idNumber || match.id2 == idNumber);
          if(match){
            let currentPlayer = match.id1 == idNumber ? "id1" : "id2";
            let otherPlayer = match.id1 == idNumber ? "id2" : "id1";
            if(data.status == "choice"){
              if(!match.tossChoice["id1"] && !match.tossChoice["id2"]){
                match.tossChoice[currentPlayer] = data.choice;
                match.tossChoice[otherPlayer] = data.choice == "even" ? "odd" : "even";
                io.to(users[match["id1"]].id).emit('toss', {status: "tossChoiceDecided", choice: match.tossChoice});
                io.to(users[match["id2"]].id).emit('toss', {status: "tossChoiceDecided", choice: match.tossChoice});
              }
              else{
                socket.emit('toss', {status: "tossChoiceDecided", choice: match.tossChoice});
              }
            }
            else if(data.status == "number"){
              if(match.tossChoice[currentPlayer] && match.tossChoice[otherPlayer]){
                if(match.tossNumbers["id1"] == null && match.tossNumbers["id2"] == null){
                  match.tossNumbers[currentPlayer] = data.number;
                  socket.emit('toss', {status: "successToSender", numberGiven: data.number})
                }
                else if(match.tossNumbers[currentPlayer] == null){
                  match.tossNumbers[currentPlayer] = data.number;
                  if(parseInt(match.tossNumbers["id1"] + parseInt(match.tossNumbers["id2"])) % 2 == 0){
                    match.tossPlayed = true;
                    if(match.tossChoice["id1"] == "even"){
                      io.to(users[match["id1"]].id).emit('toss', {status: "tossWon", winner: "id1"});
                      io.to(users[match["id2"]].id).emit('toss', {status: "tossWon", winner: "id1"});
                      match.tossWinner = "id1";
                    }
                    else{
                      io.to(users[match["id1"]].id).emit('toss', {status: "tossWon", winner: "id2"});
                      io.to(users[match["id2"]].id).emit('toss', {status: "tossWon", winner: "id2"});
                      match.tossWinner = "id2";
                    }
                  }
                  else{
                    match.tossPlayed = true;
                    if(match.tossChoice["id1"] == "odd"){
                      io.to(users[match["id1"]].id).emit('toss', {status: "tossWon", winner: "id1"});
                      io.to(users[match["id2"]].id).emit('toss', {status: "tossWon", winner: "id1"});
                      match.tossWinner = "id1";
                    }
                    else{
                      io.to(users[match["id1"]].id).emit('toss', {status: "tossWon", winner: "id2"});
                      io.to(users[match["id2"]].id).emit('toss', {status: "tossWon", winner: "id2"});
                      match.tossWinner = "id2";
                    }
                  }
                  io.to(users[match[currentPlayer]].id).emit('toss', {status: "number", [currentPlayer]: match.tossNumbers[currentPlayer], [otherPlayer]: match.tossNumbers[otherPlayer]});
                  io.to(users[match[otherPlayer]].id).emit('toss', {status: "number", [currentPlayer]: match.tossNumbers[currentPlayer], [otherPlayer]: match.tossNumbers[otherPlayer]});
                  socket.emit('toss', {status: "successToSender", numberGiven: data.number})
                }
                else{
                  socket.emit('toss', {status: "error"});
                }
              }
              else{
                socket.emit('toss', {status: "error"});
              }
            }
            else if(data.status == "inningsChoice"){
              if(match.tossWinner == currentPlayer){
                match.inningsInfo[currentPlayer] = data.choice;
                match.inningsInfo[otherPlayer] = data.choice == "bat" ? "bowl" : "bat";
                match.tossInningsChosen = true;
                io.to(users[match[currentPlayer]].id).emit('toss', {status: "inningsChosen", choice: match.inningsInfo[currentPlayer]});
                io.to(users[match[otherPlayer]].id).emit('toss', {status: "inningsChosen", choice: match.inningsInfo[otherPlayer]});
              }
              else{
                socket.emit('toss', {status: "error"});
              }
            }
            else{
              socket.emit('toss', {status: "error"});
            }
          }
        }
      })
  
      socket.on('playTurn', number => {
        function win(match, winner){
          match.winner = winner;
          io.to(users[match["id1"]].id).emit('newGame', {match: match});
          io.to(users[match["id2"]].id).emit('newGame', {match: match});
          match.currentScore = 0
          match.targetScore = null
          match.winner = null
          match.inningsInfo = {id1: "bat", id2: "bowl"}
          match.turn = {id1: true, id2: true};
          match.innings = 1;
          match.numberPlayed = {id1: null, id2: null};
          match.tossPlayed = false;
          match.tossInningsChosen = false;
          match.tossNumbers = {id1: null, id2: null};
          match.tossChoice = {id1: null, id2: null};
          match.tossWinner = null;
        
        }
        // if user is active in any match, idNumber is his idNumber
        if(matches.length > 0){
          let match = matches.find(match => match.id1 == idNumber || match.id2 == idNumber);
          if(match){
            let currentPlayer = match.id1 == idNumber ? "id1" : "id2";
            let otherPlayer = match.id1 == idNumber ? "id2" : "id1";
  
            if(match.turn[currentPlayer]){
              if(match.turn[otherPlayer]){
                match.numberPlayed[currentPlayer] = number;
                match.turn[currentPlayer] = false;
              }
              else{
                match.numberPlayed[currentPlayer] = number;
                if(match.inningsInfo[currentPlayer] == "bat"){
                  if(match.numberPlayed[otherPlayer] == number){ // OUT
  
                    if(match.innings == 1){
                      match.targetScore = match.currentScore + 1;
                      match.inningsInfo[currentPlayer] = "bowl";
                      match.inningsInfo[otherPlayer] = "bat";
                      match.currentScore = 0;
                      match.innings = 2;
                    }
                    else{
                        if(parseInt(match.currentScore) === parseInt(match.targetScore)-1){
                          win(match, "draw")
                          socket.emit('playTurn', {status: "successToSender", numberGiven: number});
                          return
                        }
                        win(match, otherPlayer);
                        socket.emit('playTurn', {status: "successToSender", numberGiven: number});
                        return
                        
                    }
  
                    match.turn = {id1: true, id2: true};
                  }
                  else{ // not OUT
                    match.currentScore += number;
                    if(match.innings == 2){
                      if(parseInt(match.currentScore) >= parseInt(match.targetScore)){
                        win(match, currentPlayer);
                        socket.emit('playTurn', {status: "successToSender", numberGiven: number});
                        return
                      }
                    }
                    match.turn = {id1: true, id2: true};
                  }
                }
  
                else{
                  if(number == match.numberPlayed[otherPlayer]){// OUT
                    if(match.innings == 1){
                      match.targetScore = match.currentScore + 1;
                      match.inningsInfo[currentPlayer] = "bat";
                      match.inningsInfo[otherPlayer] = "bowl";
                      match.innings = 2;
                      match.currentScore = 0;
                      match.turn = {id1: true, id2: true};
                    }
                    else{
                        if(parseInt(match.currentScore) === parseInt(match.targetScore)-1){
                          win(match, "draw")
                          socket.emit('playTurn', {status: "successToSender", numberGiven: number});
                          return
                        }
                        win(match, currentPlayer);
                        socket.emit('playTurn', {status: "successToSender", numberGiven: number});
                        return
                        
                    }
                  }
                  else{ // not OUT
                    match.currentScore += match.numberPlayed[otherPlayer];
                    if(match.innings == 2){
                      if(parseInt(match.currentScore) >= parseInt(match.targetScore)){
                        win(match, otherPlayer);
                        socket.emit('playTurn', {status: "successToSender", numberGiven: number});
                        return
                        
                      }
                    }
                    match.turn = {id1: true, id2: true};
                  }
                }
                socket.emit('playTurn', {status: "success", match: match});
                io.to(users[match[otherPlayer]].id).emit('playTurn', {status: "success", match: match});
                // users[match[otherPlayer]].emit('playTurn', {status: "success", match: match});
              }
              socket.emit('playTurn', {status: "successToSender", numberGiven: number});
            }
  
            else{
              socket.emit('playTurn', {status: "error"});
            }
          }
        }
  
      })
  
      socket.on('disconnect', () => {
          // console.log('user disconnected');
          // send message to the other player in a match with user
          if(matches.length > 0){
            let match = matches.find(match => match.id1 == idNumber || match.id2 == idNumber);
            if(match){
              io.to(users[match.id1 == idNumber ? match.id2 : match.id1].id).emit('opponentDisconnected', {match: match});
            }
          }
          delete users[idNumber];

          // delete all the matches the user was in
          matches = matches.filter(match => match.id1 != idNumber && match.id2 != idNumber);
          let games = JSON.parse(fs.readFileSync(path.join(process.cwd(), '/public/data/games.json'), {encoding: 'utf8', flag: 'r'}))

          // delete all the games the user was in
          let gamesEntries = Object.entries(games);

          gamesEntries.filter(([id, game]) => {
            if(game.id1 == idNumber || game.id2 == idNumber){
              delete games[id];
            }
          })

          fs.writeFileSync(path.join(process.cwd(), '/public/data/games.json'), JSON.stringify(games), {encoding: 'utf8', flag: 'w'})

          fs.writeFileSync(path.join(process.cwd(), '/public/data/games.json'), JSON.stringify(games));
      });
    });

    res.socket.server.io = io
  } else {
    console.log('socket.io already running')
  }
  res.end()
}

export default ioHandler
