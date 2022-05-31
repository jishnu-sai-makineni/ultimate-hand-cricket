import 'bootstrap/dist/css/bootstrap.min.css';
import {Form, Button} from 'react-bootstrap'

export default function Creategame(props){
    function formSubmit(e){
        e.preventDefault()
        // a post request to /creategameapi
        // with the data from the form
        // and redirect to /game
        fetch('/api/creategameapi', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                gameType: e.target.gameType.value,
                })
            })
            .then(res => res.json())
            .then(data => {
                console.log(data)
                if(data.success){
                    window.location.replace('/onlinegame?id=' + data.id + '&gameType=' + data.gameType)
                }
                else{
                    alert()
                }
            })
    }
    return (
        <div>
            <Form className="mx-3 mt-5" onSubmit={formSubmit}>
            <Form.Label>
                <h1>
                    Create a Game
                </h1>
            </Form.Label>
            <fieldset>
                <Form.Group className="w-25 mb-3">
                <Form.Label htmlFor="gameType">Select Game Type</Form.Label>
                <Form.Select name="gameType" id="gameType">
                    <option value="1">The Classic (One to Six)</option>
                    <option value="2">The Binary (Zero and One)</option>
                    <option value="3">The Risky Two (One and Six)</option>
                    <option value="4">The Popular Ten (One to Ten)</option>
                    <option value="5">One n Two (One and Two)</option>
                </Form.Select>
                </Form.Group>
                <Button type="submit">Submit</Button>
            </fieldset>
            </Form>
        </div>
    )
}