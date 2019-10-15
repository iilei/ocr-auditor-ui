import React from 'react';
import styled from 'styled-components';

const ActorStyled = styled.section`
  flex: 1 0 auto;
  background: #e91e63;
  outline: 1px solid rgba(255, 255, 255, 0.5);
`;

const Actor: React.FC = () => {
  return <ActorStyled>yo </ActorStyled>;
};

export default Actor;
