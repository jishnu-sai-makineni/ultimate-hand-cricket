const fs = require('fs');
const path = require('path');

export default function creategameapi(req, res){
    let data = { // random id
        id: Math.floor(Math.random() * 1000000).toString(),
        type: req.body.gameType
    }

    let games = JSON.parse(fs.readFileSync(path.join(process.cwd(), '/public/data/games.json'),  {encoding:'utf8', flag:'r'}))

    games[data.id] = data

    fs.writeFileSync(path.join(process.cwd(), '/public/data/games.json'), JSON.stringify(games));
    
    res.status(200).json({success: true, id: data.id, gameType: data.type})
}