import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import {Form, Button} from 'react-bootstrap'

export default function creategame(props){

    const [gameId, setGameId] = useState('')

    function formSubmit(e){
        e.preventDefault()
        // a post request to /creategameapi
        // with the data from the form
        // and redirect to /game
        window.location.replace('/onlinegame?id=' + gameId)
    }
    return (
        <div>
            <Form className="mx-3 mt-5" onSubmit={formSubmit}>
            <Form.Label>
                <h1>
                    Join a Game
                </h1>
            </Form.Label>
            {/* enter the game id */}
            <Form.Group className="w-25 mb-3">
                <Form.Label htmlFor="gameId">Enter Game ID</Form.Label>
                <Form.Control type="text" onChange={e => setGameId(e.target.value)} value={gameId} name="gameId" id="gameId" placeholder="Enter Game ID" />
            </Form.Group>
            <Button type="submit">Submit</Button>
            </Form>
        </div>
    )
}