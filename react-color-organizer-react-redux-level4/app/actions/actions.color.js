import C from '../constants/constants.color';

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

export const sortColors = sortBy =>
  ({
    type: "SORT_COLORS",
    sortBy
  });

// export const sortColors = sortedBy => {
//   if (sortedBy === "rating") {
//     return {
//       type: C.SORT_COLORS,
//       sortBy: "SORTED_BY_RATING"
//     };
//   }
//   else if (sortedBy === "title") {
//     return {
//       type: C.SORT_COLORS,
//       sortBy: "SORTED_BY_TITLE"
//     };
//   }
//   else return {
//     type: C.SORT_COLORS,
//     sortBy: "SORTED_BY_DATE"
//   };
// };

