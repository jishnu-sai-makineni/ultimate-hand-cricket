import 'bootstrap/dist/css/bootstrap.min.css';
import { Card, Col, Container, Row } from 'react-bootstrap';
import Link from 'next/link';

export default function App(){
    return(
      <Container>
      <Row>
        <Container>
          <h1 className='text-center'>Welcome to the bad replication of hand cricket by Jishnu</h1>
          <h2 className='text-center'>Click on create game to create a game and send your friend the id/link</h2>
          <h2 className='text-center'>Warning: judging my ui design is bannable🔨</h2>
        </Container>
      </Row>
      <Row>
        {/* <Col className="w-50">
          <Card>
            <Card.Img style={{width: "100%", height: "300px"}} src="https://www.colorhexa.com/42ffff.png" />
            <Link className='stretched-link' href='/?a=nyom'><a className='stretched-link'></a></Link>
            <Card.ImgOverlay>
              <Card.Title>Matchmaking with randy</Card.Title>
            </Card.ImgOverlay>
          </Card>
        </Col> */}
        <Col className="w-50">
          <Card >
            <Card.Img style={{width: "100%", height: "300px"}} src="https://www.colorhexa.com/69facd.png" />
              <Link className='stretched-link' href='/joingame'><a className='stretched-link'></a></Link>
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
            <Link className='stretched-link' href='/creategame'><a className='stretched-link'></a></Link>
            <Card.ImgOverlay>
                <Card.Title>Create a Game</Card.Title>
            </Card.ImgOverlay>
          </Card>
        </Col>
        {/* <Col className="w-50">
          <Card >
            <Card.Img style={{width: "100%", height: "300px"}} src="https://www.colorhexa.com/82feeb.png" />
            <Link className='stretched-link' href='/?a=nyoooom'><a className='stretched-link'></a></Link>
            <Card.ImgOverlay>
              <Card.Title>TO BE DECLARED</Card.Title>
            </Card.ImgOverlay>
          </Card>
          
        </Col> */}
      </Row>
    </Container>
    )
}