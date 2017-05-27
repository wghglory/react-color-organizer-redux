import React from 'react';
import PropTypes from 'prop-types';
import Color from './Color';
import '../scss/ColorList.scss';

/*// when redux passes store explicitly, it has to pass it level by level
// but when passing store via context, ColorList doesn't need a store, and it's just a UI component. Color can get store directly
// import { rateColor, removeColor } from '../redux/actions.color';
// import { sortFunction } from '../utils/arrayHelper';

const ColorList = ({ store }) => {
    const { colors, sort } = store.getState();
    const sortedColors = [...colors].sort(sortFunction(sort));
    return (
        <div className="color-list">
            {(colors.length === 0) ?
                <p>No Colors Listed. (Add a Color)</p> :
                sortedColors.map(color =>
                    <Color key={color.id}
                        {...color}
                        onRate={(rating) =>
                            store.dispatch(
                                rateColor(color.id, rating)
                            )
                        }
                        onRemove={() =>
                            store.dispatch(
                                removeColor(color.id)
                            )
                        }
                    />
                )
            }
        </div>
    );
};

ColorList.propTypes = {
    store: PropTypes.object
};*/



const ColorList = ({ colors = [] }) =>
    (
        <div className="color-list">
            {(colors.length === 0) ?
                <p>No Colors Listed. (Add a Color)</p> :
                colors.map(color =>
                    <Color key={color.id}
                        {...color} />
                )
            }
        </div>
    );

ColorList.propTypes = {
    colors: PropTypes.array
};


export default ColorList;