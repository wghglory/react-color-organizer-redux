import React from 'react';
import '../../scss/Menu.scss';
import { PropTypes } from 'prop-types';

const options = {
    date: "SORTED_BY_DATE",
    title: "SORTED_BY_TITLE",
    rating: "SORTED_BY_RATING"
};

/* // pass store via context
const SortMenu = (props, { store }) =>
    (
        <nav className="menu">
            <h1>Sort Colors</h1>
            {Object.keys(options).map((item, i) =>
                <a key={i}
                    href="#"
                    className={(store.getState().sort === options[item]) ? "selected" : null}
                    onClick={e => {
                        e.preventDefault();
                        store.dispatch(sortColors(options[item]));
                    }}>{item}</a>
            )}
        </nav>
    );

SortMenu.contextTypes = {
    store: PropTypes.object
};*/

const SortMenu = ({ sort = "SORTED_BY_DATE", onSelect = f => f }) =>
    (
        <nav className="menu">
            <h1>Sort Colors</h1>
            {Object.keys(options).map((item, i) =>
                <a key={i}
                    href="#"
                    className={(sort === options[item]) ? "selected" : null}
                    onClick={e => {
                        e.preventDefault();
                        onSelect(options[item]);
                    }}>{item}</a>
            )}
        </nav>
    );

SortMenu.propTypes = {
    sort: PropTypes.string,
    onSelect: PropTypes.func
};

export default SortMenu;