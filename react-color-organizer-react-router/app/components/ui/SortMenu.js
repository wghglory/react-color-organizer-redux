import React from 'react';
import '../../scss/Menu.scss';
import { PropTypes } from 'prop-types';

/*const options = {
    date: "SORTED_BY_DATE",
    title: "SORTED_BY_TITLE",
    rating: "SORTED_BY_RATING"
};

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

export default SortMenu;*/

import { NavLink } from 'react-router-dom';

const selectedStyle = { color: 'red' };

const SortMenu = () =>
    <nav className="menu">
        <NavLink to="/" exact activeStyle={selectedStyle}>date</NavLink>
        <NavLink to="/sort/title" activeStyle={selectedStyle}>title</NavLink>
        <NavLink to="/sort/rating" activeStyle={selectedStyle}>rating</NavLink>
    </nav>;

SortMenu.propTypes = {
    sort: PropTypes.string
};

export default SortMenu;