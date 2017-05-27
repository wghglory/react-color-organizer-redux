// redux passes store via context
import React from 'react';
import PropTypes from 'prop-types';
import '../scss/App.scss';
import AddColorForm from './AddColorForm';
import SortMenu from './SortMenu';
import ColorList from './ColorList';

import { sortFunction } from '../utils/arrayHelper';

class App extends React.Component {

    // return the object that defines the context
    getChildContext() {
        return {
            store: this.props.store
        };
    }

    componentWillMount() {
        this.unsubscribe = window.store.subscribe(
            () => this.forceUpdate()
        );
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    render() {
        const { colors, sort } = window.store.getState();
        const sortedColors = [...colors].sort(sortFunction(sort));
        return (
            <div className="app">
                <SortMenu />
                <AddColorForm />
                <ColorList colors={sortedColors} />
            </div>
        );
    }

}

App.propTypes = {
    store: PropTypes.object.isRequired
};

// define your context object
App.childContextTypes = {
    store: PropTypes.object.isRequired
};

export default App;

