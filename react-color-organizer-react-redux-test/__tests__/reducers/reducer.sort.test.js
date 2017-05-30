import C from '../../app/constants/constants.color';
import { sortReducer } from '../../app/reducers/reducer.sort';
import deepFreeze from 'deep-freeze';

describe("sort Reducer", () => {

  it("SORT_COLORS success", () => {
    const state = {};
    const action = {
      type: C.SORT_COLORS,
      sortBy: "SORTED_BY_RATING"
    }
    deepFreeze(state)
    deepFreeze(action)
    expect(sortReducer(state, action)).toEqual("SORTED_BY_RATING")
  })

  it("defaults to SORTED_BY_DATE", () => {
    expect(sortReducer()).toEqual("SORTED_BY_DATE")
  })
  
})