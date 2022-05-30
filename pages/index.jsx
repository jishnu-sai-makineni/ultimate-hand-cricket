import 'bootstrap/dist/css/bootstrap.min.css';
import { Card, Col, Container, Row } from 'react-bootstrap';

export async function getServerSideProps(context) {
  return({props: {query: context.query}})
  // will be passed to the page component as props
}


export default function App(props){
    return(
      <Container>
      <Row>
        <Col className="w-50">
          <Card>
            <Card.Img style={{width: "100%", height: "300px"}} src="https://www.colorhexa.com/42ffff.png" />
            <a className='stretched-link' href='/?a=nyom'></a>
            <Card.ImgOverlay>
              <Card.Title>Matchmaking with randy</Card.Title>
            </Card.ImgOverlay>
          </Card>
        </Col>
        <Col className="w-50">
          <Card >
            <Card.Img style={{width: "100%", height: "300px"}} src="https://www.colorhexa.com/69facd.png" />
              <a className='stretched-link' href='/joinGame'></a>
              <Card.ImgOverlay>
                <Card.Title>Join a Game</Card.Title>
              </Card.ImgOverlay>
            </Card>
        </Col>
      </Row>
      <Row className='mt-2'>
        <Col className="w-50">
          <Card >
            <Card.Img style={{width: "100%", height: "300px"}} src="https://www.colorhexa.com/27caeb.png" />
            <a className='stretched-link' href='/createGame'></a>
            <Card.ImgOverlay>
                <Card.Title>Create a Game</Card.Title>
            </Card.ImgOverlay>
          </Card>
        </Col>
        <Col className="w-50">
          <Card >
            <Card.Img style={{width: "100%", height: "300px"}} src="https://www.colorhexa.com/82feeb.png" />
            <a className='stretched-link' href='/?a=nyoooom'></a>
            <Card.ImgOverlay>
              <Card.Title>TO BE DECLARED</Card.Title>
            </Card.ImgOverlay>
          </Card>
          
        </Col>
      </Row>
    </Container>
    )
}