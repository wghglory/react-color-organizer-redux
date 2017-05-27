import React from 'react';
import PropTypes from 'prop-types';
import Color from './Color';
import '../scss/ColorList.scss';

// use store
import { rateColor, removeColor } from '../redux/actions.color';
import { sortFunction } from '../utils/arrayHelper';

const ColorList = ({ store }) => {
    const { colors, sort } = store.getState();
    const sortedColors = [...colors].sort(sortFunction(sort));
    return (
        <div className="color-list">
            {(colors.length === 0) ?
                <p>No Colors Listed. (Add a Color)</p> :
                // old code: use react state
                // colors.map(color =>
                //     <Color key={color.id}
                //         {...color}
                //         onRate={(rating) => onRate(color.id, rating)}
                //         onRemove={() => onRemove(color.id)} />
                // )
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
};

export default ColorList;