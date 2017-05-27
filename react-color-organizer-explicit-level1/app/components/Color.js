import React from 'react';
import PropTypes from 'prop-types';
import StarRating from './StarRating';
import '../scss/Color.scss';
import TimeAgo from './TimeAgo';
import FaTrash from 'react-icons/lib/fa/trash-o';

export default class Color extends React.Component {

    // before mount, similar to write this style directly on jsx element
    componentWillMount() {
        this.style = { backgroundColor: "#CCC" };
    }

    // this is useful if you know exactly what you want to re-render. 
    // If not using it in this example, each color component will be updated rather than just one clicked.
    // if clicked star is same with prev, no component updates
    shouldComponentUpdate(nextProps) {
        const { rating } = this.props;
        return rating !== nextProps.rating;
    }

    componentWillUpdate(nextProps) {
        const { title, rating } = this.props;
        this.style = null;
        // style change can hardly see, too quick
        this._title.style.backgroundColor = "red";
        this._title.style.color = "white";
        alert(`${title}: rating ${rating} -> ${nextProps.rating}`);
    }

    componentDidUpdate(prevProps) {
        const { title, rating } = this.props;
        const status = (rating > prevProps.rating) ? 'better' : 'worse';
        alert(`${title} is getting ${status}`);
        this._title.style.backgroundColor = "";
        this._title.style.color = "black";
    }

    render() {
        const { title, color, rating, timestamp, onRemove, onRate } = this.props;
        return (
            <section className="color" style={this.style}>
                <h1 ref={t => this._title = t}>{title}</h1>
                <button onClick={onRemove}>
                    <FaTrash />
                </button>
                <div className="color"
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
    onRate: PropTypes.func
};

Color.defaultProps = {
    rating: 0,
    onRemove: f => f,
    onRate: f => f
};

