import React from 'react';
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';
import { Normalize } from '@smooth-ui/core-sc';

import SplitView from './SplitView';
import Toolbar from './Toolbar';

const customConf = {
  mediaQuery: 'only screen',
  columns: {
    xs: 4,
    sm: 8,
    md: 8,
    lg: 12,
    xl: 12,
  },
  gutterWidth: {
    xs: 1,
    sm: 1,
    md: 1.5,
    lg: 1.5,
    xl: 1.5,
  },
  paddingWidth: {
    xs: 1,
    sm: 1,
    md: 1.5,
    lg: 1.5,
    xl: 1.5,
  },
  container: {
    xs: 'full', // 'full' = max-width: 100%
    sm: 'full', // 'full' = max-width: 100%
    md: 'full', // 'full' = max-width: 100%
    lg: 'full', // max-width: 1440px
    xl: 'full', // max-width: 1440px
  },
  breakpoints: {
    xs: 1,
    sm: 48, // 768px
    md: 64, // 1024px
    lg: 90, // 1440px
    xl: 120, // 1920px
  },
};

const theme = {
  colors: {
    primary: '#2275a8',
  },
};

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

    display: flex;
    min-height: 100vh;
    flex-direction: column;
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

const StyledSplitView = styled(SplitView)`
  display: flex;
  flex: 1;
`;

const App: React.FC = () => {
  return (
    <Router>
      <ThemeProvider theme={{ awesomegrid: customConf, ...theme }}>
        <React.Fragment>
          <Normalize />
          <Route exact path="/">
            <Redirect to="/doc/phototest/1/" />
          </Route>
          <Route path="/doc/:id/:page?">
            <React.Fragment>
              <GlobalStyle />
              <SplitView />
              <Toolbar />
            </React.Fragment>
          </Route>
        </React.Fragment>
      </ThemeProvider>
    </Router>
  );
};

export default App;
