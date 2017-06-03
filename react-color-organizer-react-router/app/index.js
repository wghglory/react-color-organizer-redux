import React from 'react';
import ReactDOM from 'react-dom';

// bootstrap core. specific plugin like jumbotron is imported in needed component.
// import './bootstrap/_core.scss';

/* react-redux library Provider, Connect */
import App from './components/App';
import storeFactory from './store/storeFactory';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';

const store = storeFactory();

ReactDOM.render(
  <Provider store={store}>
    <HashRouter>
      <App />
    </HashRouter>
  </Provider>,
  document.getElementById('app')
);