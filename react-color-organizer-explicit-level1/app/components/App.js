// redux passes store explicitly to every component
import React from 'react';
import PropTypes from 'prop-types';
import '../scss/App.scss';
import AddColorForm from './AddColorForm';
import SortMenu from './SortMenu';
import ColorList from './ColorList';

const App = ({ store }) =>
    <div className="app">
        <SortMenu store={store} />
        <AddColorForm store={store} />
        <ColorList store={store} />
    </div>;

App.propTypes = {
    store: PropTypes.object.isRequired
};

export default App;