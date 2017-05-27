import React from 'react';
import { ago } from '../utils/timeHelper';
import PropTypes from 'prop-types';

const TimeAgo = ({ timestamp }) =>
  (
    <div className="time-ago">
      {ago(timestamp)}
    </div>
  );

TimeAgo.propTypes = {
  timestamp: PropTypes.string.isRequired
};

export default TimeAgo;