import React from 'react';
import styled from 'styled-components';
import { Container, Row, Col } from 'react-awesome-styled-grid';
import HocrView from './HocrView';

const Actor = styled.section`
  flex: 1 0 auto;
  background: #e91e63;
  outline: 1px solid rgba(255, 255, 255, 0.5);
`;

// Number of columns: xs: 4, sm: 8, md: 8, lg: 12, xl: 12
const SplitView: React.FC = () => {
  return (
    <Container>
      <Row>
        <Col xs={4} sm={4}>
          <HocrView />
        </Col>
        <Col xs={4} sm={4}>
          <Actor />
        </Col>
      </Row>
    </Container>
  );
};

export default SplitView;
