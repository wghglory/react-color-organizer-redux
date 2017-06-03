import React from 'react';
import PropTypes from 'prop-types';
import StarRating from './StarRating';
import '../../scss/Color.scss';
import TimeAgo from './TimeAgo';
import FaTrash from 'react-icons/lib/fa/trash-o';

import { withRouter } from 'react-router-dom';

class Color extends React.Component {
  render() {
    const { id, title, color, rating, timestamp, onRemove, onRate, history } = this.props;
    return (
      <section className="color" style={this.style}>
        <h1
          onClick={() => history.push(`/${id}`)}>{title}</h1>
        <button onClick={onRemove}>
          <FaTrash />
        </button>
        <div className="color"
          onClick={() => history.push(`/${id}`)}
          style={{ backgroundColor: color }}>
        </div>
        <TimeAgo timestamp={timestamp} />
        <div>
          <StarRating starsSelected={rating} onRate={onRate} />
        </div>
      </section>
    );
  }

}

Color.propTypes = {
  title: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  rating: PropTypes.number,
  timestamp: PropTypes.string,
  onRemove: PropTypes.func,
  onRate: PropTypes.func,
  id: PropTypes.string.isRequired,
  history: PropTypes.object
};

Color.defaultProps = {
  rating: 0,
  onRemove: f => f,
  onRate: f => f
};

export default withRouter(Color);
