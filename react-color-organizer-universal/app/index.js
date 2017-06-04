import React from 'react';
import ReactDOM from 'react-dom';

// bootstrap core. specific plugin like jumbotron is imported in needed component.
// import './bootstrap/_core.scss';

import App from './components/App';
import storeFactory from './store/storeFactory';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

const store = storeFactory(false, window.__INITIAL_STATE__);

// window.React = React;
// window.store = store;

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>,
  document.getElementById('app')
);