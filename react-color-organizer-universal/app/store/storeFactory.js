import { createStore, combineReducers, applyMiddleware } from 'redux';
import { colorsReducer } from '../reducers/reducer.color';
// import { sortReducer } from '../reducers/reducer.sort';
import thunk from 'redux-thunk';

/*
import stateData from '../../data/initialState.json';

const saver = store => next => action => {
  let result = next(action);
  localStorage['redux-store'] = JSON.stringify(store.getState());
  return result;
};

const storeFactory = (initialState = stateData) =>
  applyMiddleware(logger, saver)(createStore)(
    combineReducers({ colors: colorsReducer }),
    (localStorage['redux-store']) ?
      JSON.parse(localStorage['redux-store']) :
      initialState
  );
*/

const clientLogger = store => next => action => {
  let result;
  console.groupCollapsed("dispatching", action.type);
  console.log('prev state', store.getState());
  console.log('action', action);
  result = next(action);
  console.log('next state', store.getState());
  console.groupEnd();
  return result;
};

const serverLogger = store => next => action => {
  console.log('\n  dispatching server action\n');
  console.log(action);
  console.log('\n');
  return next(action);
};

const middleware = server => [
  (server) ? serverLogger : clientLogger,
  thunk
];

const storeFactory = (server = false, initialState = {}) =>
  applyMiddleware(...middleware(server))(createStore)(
    combineReducers({ colors: colorsReducer }),
    initialState
  );

export default storeFactory;