import React from 'react';
import { createGlobalStyle } from 'styled-components';

import SplitView from './SplitView';
import Toolbar from './Toolbar';

const GlobalStyle = createGlobalStyle`
  html {
    height: 100%;
  }
  body {
    margin: 0;
    font-family: 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    height: 100%;
  }
  
  #root {    
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
  }
`;

const App: React.FC = () => {
  return (
    <React.Fragment>
      <GlobalStyle />
      <Toolbar />
      <SplitView />
    </React.Fragment>
  );
};

export default App;
