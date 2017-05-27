## Explicitly Passing the Store (level 1)

The first, and most logical way, to incorporate the store into your UI is to pass it down the component tree explicitly as a property. 

The store has been passed all the way down the component tree to the ColorList component. This component interacts with the store directly. When colors are rated or removed, those actions are dispatched to the store.

The store is also used to obtain the original colors. Those colors are duplicated and sorted according to the store’s sort property and saved as sortedColors. sortedColors is then used to create the UI.

This approach is great if your component tree is rather small, like this color organizer. The drawback of using this approach is that we have to explicitly pass the store to child components, which means slightly more code and slightly more headaches than with other approaches. Additionally, the SortMenu, AddColorForm, and ColorList components require this specific store. It would be hard to reuse them in another application.

index.js

```jsx
import React from 'react';
import ReactDOM from 'react-dom';

// bootstrap core. specific plugin like jumbotron is imported in needed component.
// import './bootstrap/_core.scss';

/* Explicitly Passing the Store */
import App from './components/App';
import storeFactory from './redux/store.color';

const store = storeFactory();

// [eslint] Do not depend on the return value from ReactDOM.render (react/no-render-return-value)
const render = () => ReactDOM.render(
  <App store={store} />,
  document.getElementById('app')
);

store.subscribe(render);
render();
```

components/app.js

```jsx
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
```