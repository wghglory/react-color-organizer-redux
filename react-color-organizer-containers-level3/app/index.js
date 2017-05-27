import React from 'react';
import ReactDOM from 'react-dom';

// bootstrap core. specific plugin like jumbotron is imported in needed component.
// import './bootstrap/_core.scss';

import App from './components/App';
import storeFactory from './redux/store.color';

const store = storeFactory();

// must do this, so App can find store
window.store = store;

ReactDOM.render(
  <App store={store} />,
  document.getElementById('app')
);

