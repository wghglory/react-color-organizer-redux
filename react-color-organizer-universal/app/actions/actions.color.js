/*import C from '../constants/constants.color';

import { v4 } from 'uuid';

export const addColor = (title, color) =>
  ({
    type: C.ADD_COLOR,
    id: v4(),
    title,
    color,
    timestamp: new Date().toString()
  });

export const removeColor = id =>
  ({
    type: C.REMOVE_COLOR,
    id
  });

export const rateColor = (id, rating) =>
  ({
    type: C.RATE_COLOR,
    id,
    rating
  });
*/

import fetch from 'isomorphic-fetch'

const parseResponse = response => response.json()

const logError = error => console.error(error)

const fetchThenDispatch = (dispatch, url, method, body) =>
  fetch(url, { method, body, headers: { 'Content-Type': 'application/json' } })
    .then(parseResponse)
    .then(dispatch)
    .catch(logError)

export const addColor = (title, color) => dispatch =>
  fetchThenDispatch(
    dispatch,
    '/api/colors',
    'POST',
    JSON.stringify({ title, color })
  )

export const removeColor = id => dispatch =>
  fetchThenDispatch(
    dispatch,
    `/api/color/${id}`,
    'DELETE'
  )

export const rateColor = (id, rating) => dispatch =>
  fetchThenDispatch(
    dispatch,
    `/api/color/${id}`,
    'PUT',
    JSON.stringify({ rating })
  )
