import C from '../constants/constants.color';

export const sortReducer = (state = "SORTED_BY_DATE", action) => {
  if (action === undefined || action.sortBy === undefined) {
    return state;
  }
  switch (action.type) {
    case C.SORT_COLORS:
      return action.sortBy;
    default:
      return state;
  }
};

