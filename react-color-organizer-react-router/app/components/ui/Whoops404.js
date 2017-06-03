import React from 'react';
import PropTypes from 'prop-types';
const Whoops404 = ({ location }) =>
  <div className="whoops-404">
    <h1>Whoops cannot find resource at <em>{location.pathname}</em></h1>
  </div>;

export default Whoops404;

Whoops404.propTypes = {
  location: PropTypes.object
};