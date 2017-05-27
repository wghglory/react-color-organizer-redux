import React from 'react';
import ReactDOM from 'react-dom';

// bootstrap core. specific plugin like jumbotron is imported in needed component.
// import './bootstrap/_core.scss';

/* Explicitly Passing the Store */
import App from './components/App';
import storeFactory from './redux/store.color';

const store = storeFactory();

// [eslint] Do not depend on the return value from ReactDOM.render (react/no-render-return-value)
const render = () => ReactDOM.render(
  <App store={store} />,
  document.getElementById('app')
);

store.subscribe(render);
render();

// The above example can’t be used in real world applications since it’s not maintainable or testable. 
// So we need better way to use redux with react. 
// That’s where react-redux comes into picture.