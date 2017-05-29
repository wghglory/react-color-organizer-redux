import C from '../constants/constants.color';

export const colorReducer = (state = {}, action) => {
  if (action === undefined || action.type === undefined) {
    return state;
  }
  switch (action.type) {
    case C.ADD_COLOR:
      return {
        id: action.id,
        title: action.title,
        color: action.color,
        timestamp: action.timestamp,
        rating: 0
      };
    case C.RATE_COLOR:
      return (state.id !== action.id) ?
        state :
        // Object.assign({}, state, { rating: action.rating });
        {
          ...state,
          rating: action.rating
        };
    default:
      return state;
  }
};

export const colorsReducer = (state = [], action) => {
  if (action === undefined || action.type === undefined) {
    return state;
  }
  switch (action.type) {
    case C.ADD_COLOR:
      return [
        ...state,
        colorReducer({}, action)
      ];
    case C.RATE_COLOR:
      return state.map(
        c => colorReducer(c, action)
      );
    case C.REMOVE_COLOR:
      return state.filter(
        c => c.id !== action.id
      );
    default:
      return state;
  }
};