import React from 'react';
import ReactDOM from 'react-dom';
import HocrView from './HocrView';
import DocumentLoader from './DocumentLoader';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <DocumentLoader url="/phototest.json" page={1}>
    <HocrView />
  </DocumentLoader>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
