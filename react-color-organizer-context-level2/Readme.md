## Passing the Store via Context (Level 2)

Let’s say we have some cargo to move from Washington, DC, to San Francisco, CA. We could use a train, but that would require that we lay tracks through at least nine states so that our cargo can travel to California. This is like explicitly passing the store down the component tree from the root to the leaves. You have to “lay tracks” through every component that comes between the origin and the destination. If using a train is like explicitly passing the store through props, then implicitly passing the store via context is like using a jet airliner. When a jet flies from DC to San Francisco, it flies over at least nine states—no tracks required.

Similarly, we can take advantage of a React feature called context that allows us to pass variables to components without having to explicitly pass them down through the tree as properties.1 Any child component can access these context variables.

If we were to pass the store using context in our color organizer app, the first step would be to refactor the App component to hold context. The App component will also need to listen to the store so that it can trigger a UI update every time the state changes:

components/app.js

```diff
// redux passes store via context
import React from 'react';
import PropTypes from 'prop-types';
import '../scss/App.scss';
import AddColorForm from './AddColorForm';
import SortMenu from './SortMenu';
import ColorList from './ColorList';

import { sortFunction } from '../utils/arrayHelper';

class App extends React.Component {

    // 1. return the object that defines the context
+    getChildContext() {
+        return {
+            store: this.props.store
+        };
+    }

+    componentWillMount() {
+        this.unsubscribe = window.store.subscribe(
+            () => this.forceUpdate()
+        );
+    }

+    componentWillUnmount() {
+        this.unsubscribe();
+    }

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
+ App.childContextTypes = {
+    store: PropTypes.object.isRequired
+ };

export default App;
```

First, adding context to a component requires that you use the `getChildContext` lifecycle function. It will return the object that defines the context. In this case, we add the store to the context, which we can access through props.

Next, you will need to specify `childContextTypes` on the component instance and define your context object. This is similar to adding propTypes or defaultProps to a component instance. However, for context to work, you must take this step.

At this point, any children of the App component will have access to the store via the context. They can invoke `store.getState` and `store.dispatch` directly. The final step is to subscribe to the store and update the component tree every time the store updates state. This can be achieved with the mounting lifecycle functions. In `componentWillMount`, we can subscribe to the store and use `this.forceUpdate` to trigger the updating lifecycle, which will re-render our UI. In `componentWillUnmount`, we can invoke the `unsubscribe` function and stop listening to the store. Because the App component itself triggers the UI update, there is no longer a need to subscribe to the store from the entry ./index.js file; we are listening to store changes from the same component that adds the store to the context, App.

index.js

```diff
import React from 'react';
import ReactDOM from 'react-dom';

// bootstrap core. specific plugin like jumbotron is imported in needed component.
// import './bootstrap/_core.scss';

/* Explicitly Passing the Store */
import App from './components/App';
import storeFactory from './redux/store.color';

const store = storeFactory();

+ window.store = store;

ReactDOM.render(
  <App store={store} />,
  document.getElementById('app')
);
```

AddColorForm.js: function -- `(props, { store }) => { }`

```diff
import React from 'react';
import PropTypes from 'prop-types';
import '../scss/AddColorForm.scss';

// use store, need action
import { addColor } from '../redux/actions.color';

+ const AddColorForm = (props, { store }) => {
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

+ AddColorForm.contextTypes = {
+    store: PropTypes.object
+ };

export default AddColorForm;
```

**The context object is passed to stateless functional components as the "second argument", after props. Note first param must be props, and second store context.** We can use object destructuring to obtain the store from this object directly in the arguments. In order to use the store, we must define `contextTypes` on the AddColorForm instance. This is where we tell React which context variables this component will use. This is a required step. Without it, the store cannot be retrieved from the context.

ColorList.js

```jsx
import React from 'react';
import PropTypes from 'prop-types';
import Color from './Color';
import '../scss/ColorList.scss';

/*// when redux passes store explicitly, it has to pass it level by level
// but when passing store via context, ColorList doesn't need a store, and it's just a UI component. Color can get store directly
// import { rateColor, removeColor } from '../redux/actions.color';
// import { sortFunction } from '../utils/arrayHelper';

const ColorList = ({ store }) => {
    const { colors, sort } = store.getState();
    const sortedColors = [...colors].sort(sortFunction(sort));
    return (
        <div className="color-list">
            {(colors.length === 0) ?
                <p>No Colors Listed. (Add a Color)</p> :
                sortedColors.map(color =>
                    <Color key={color.id}
                        {...color}
                        onRate={(rating) =>
                            store.dispatch(
                                rateColor(color.id, rating)
                            )
                        }
                        onRemove={() =>
                            store.dispatch(
                                removeColor(color.id)
                            )
                        }
                    />
                )
            }
        </div>
    );
};

ColorList.propTypes = {
    store: PropTypes.object
};*/


const ColorList = ({ colors = [] }) =>
    (
        <div className="color-list">
            {(colors.length === 0) ?
                <p>No Colors Listed. (Add a Color)</p> :
                colors.map(color =>
                    <Color key={color.id}
                        {...color} />
                )
            }
        </div>
    );

ColorList.propTypes = {
    colors: PropTypes.array
};


export default ColorList;
```

Color.js: class -- `const { store } = this.context;`

```diff
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
+        const { store } = this.context;
        return (
            <section className="color" style={this.style}>
                <h1 ref={t => this._title = t}>{title}</h1>
                <button onClick={() =>
+                    store.dispatch(removeColor(id))
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
+                            store.dispatch(rateColor(id, rating))
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

+ Color.contextTypes = {
+     store: PropTypes.object
+ };

Color.defaultProps = {
    rating: 0
};
```

Color is a component class, and can access context via `this.context`. Colors are now read directly from the store via store.getState. The same rules apply that do for stateless functional components. contextTypes must be defined on the instance.

sortMenu.js

```diff
import React from 'react';
import '../scss/Menu.scss';
import { PropTypes } from 'prop-types';
import { sortColors } from '../redux/actions.color';

const options = {
    date: "SORTED_BY_DATE",
    title: "SORTED_BY_TITLE",
    rating: "SORTED_BY_RATING"
};

+ const SortMenu = (props, { store }) =>
    (
        <nav className="menu">
            <h1>Sort Colors</h1>
            {Object.keys(options).map((item, i) =>
                <a key={i}
                    href="#"
                    className={(store.getState().sort === options[item]) ? "selected" : null}
                    onClick={e => {
                        e.preventDefault();
                        store.dispatch(sortColors(options[item]));
                    }}>{item}</a>
            )}
        </nav>
    );

+ SortMenu.contextTypes = {
+     store: PropTypes.object
+ };

export default SortMenu;
```