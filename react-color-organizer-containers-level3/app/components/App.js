// redux passes store via context
import React from 'react';
import PropTypes from 'prop-types';
import '../scss/App.scss';
import { Menu, NewColor, Colors } from './Containers';

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
        return (
            <div className="app">
                <Menu />
                <NewColor />
                <Colors />
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

