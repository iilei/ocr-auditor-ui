import React from 'react';
import { Container, Row, Col } from 'react-awesome-styled-grid';

const Toolbar: React.FC = () => {
  return (
    <footer>
      <Container>
        <Row>
          <Col md={8}>Footer</Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Toolbar;
