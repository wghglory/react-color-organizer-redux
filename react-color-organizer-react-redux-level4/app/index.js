import React from 'react';
import ReactDOM from 'react-dom';

// bootstrap core. specific plugin like jumbotron is imported in needed component.
// import './bootstrap/_core.scss';

/* Explicitly Passing the Store */
import App from './components/App';
import storeFactory from './store/storeFactory';
import { Provider } from 'react-redux';


const store = storeFactory();

// must do this, so App can find store
window.store = store;

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('app')
);

