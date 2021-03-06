import React from 'react';
import PropTypes from 'prop-types';
import '../../scss/AddColorForm.scss';

// use store, need action
// import { addColor } from '../redux/actions.color';

/*const AddColorForm = (props, { store }) => {
    let _title, _color;

    const submit = e => {
        e.preventDefault();
        store.dispatch(addColor(_title.value, _color.value)); // use store
        _title.value = '';
        _color.value = '#000000';
        _title.focus();
    };

    return (
        <form className="add-color" onSubmit={submit}>
            <input ref={input => _title = input}
                type="text"
                placeholder="color title..." required />
            <input ref={input => _color = input}
                type="color" required />
            <button>ADD</button>
        </form>
    );

};

AddColorForm.contextTypes = {
    store: PropTypes.object
};*/

const AddColorForm = ({ onNewColor = f => f }) => {

    let _title, _color;

    const submit = e => {
        e.preventDefault();
        onNewColor(_title.value, _color.value);
        _title.value = '';
        _color.value = '#000000';
        _title.focus();
    };

    return (
        <form className="add-color" onSubmit={submit}>
            <input ref={input => _title = input}
                type="text"
                placeholder="color title..." required />
            <input ref={input => _color = input}
                type="color" required />
            <button>ADD</button>
        </form>
    );

};

AddColorForm.propTypes = {
    onNewColor: PropTypes.func
};

export default AddColorForm;