import React from 'react';
import PropTypes from 'prop-types';
import StarRating from './StarRating';
import '../scss/Color.scss';
import TimeAgo from './TimeAgo';
import FaTrash from 'react-icons/lib/fa/trash-o';
import { removeColor, rateColor } from '../redux/actions.color';

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
        const { id, title, color, rating, timestamp } = this.props;
        const { store } = this.context;
        return (
            <section className="color" style={this.style}>
                <h1 ref={t => this._title = t}>{title}</h1>
                <button onClick={() =>
                    store.dispatch(removeColor(id))
                }>
                    <FaTrash />
                </button>
                <div className="color"
                    style={{ backgroundColor: color }}>
                </div>
                <TimeAgo timestamp={timestamp} />
                <div>
                    <StarRating starsSelected={rating}
                        onRate={rating =>
                            store.dispatch(rateColor(id, rating))
                        } />
                </div>
            </section>
        );
    }

}

Color.propTypes = {
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    rating: PropTypes.number,
    timestamp: PropTypes.string
};

Color.contextTypes = {
    store: PropTypes.object
};

Color.defaultProps = {
    rating: 0
};