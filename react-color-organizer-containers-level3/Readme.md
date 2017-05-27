## Presentational VS Container Components

Passing Store via Context, add containers(Level 3)

In the last example, the Color component retrieved the store via context and used it to dispatch `RATE_COLOR` and `REMOVE_COLOR` actions directly. Before that, the ColorList component retrieved the store via context to read the current list of colors from state. In both examples, these components rendered UI elements by interacting directly with the Redux store. We can improve the architecture of our application by decoupling the store from components that render the UI.

Presentational components are components that only render UI elements. They do not tightly couple with any data architecture. Instead, they receive data as props and send data to their parent component via callback function properties. They are purely concerned with the UI and can be reused across applications that contain different data.

Container components are components that connect presentational components to the data. In our case, container components will retrieve the store via context and manage any interactions with the store. They render presentational components by mapping properties to state and callback function properties to the store’s dispatch method. Container components are not concerned with UI elements; they are used to connect presentational components to data.

There are many benefits to this architecture. Presentational components are reusable. They are easy to swap out and easy to test. They can be composed to create the UI. Presentational components can be reused across browser applications that may use different data libraries.

Container components are not concerned with the UI at all. Their main focus is connecting the presentation components to the data architecture. Container components can be reused across device platforms to connect native presentational components to the data.

The AddColorForm, ColorList, Color, StarRating, and Star components that we created are examples of presentational components. They receive data via props, and when events occur, they invoke callback function properties. We are already pretty familiar with presentation components, so let’s see how we can use them to create container components.

The App component will mostly remain the same. It still defines the store in the context so that it can be retrieved by child components. Instead of rendering the SortMenu, AddColorForm, and ColorList components, however, it will render containers for those items. The Menu container will connect the SortMenu, NewColor will connect the AddColorForm, and Colors will connect the ColorList:

App.js

```jsx
render() {
    return (
        <div className="app">
            <Menu />
            <NewColor />
            <Colors />
        </div>
    )
}
```

Any time you want to connect a presentational component to some data, you can wrap that component in a container that controls the properties and connects them to data. The NewColor container, Menu container, and Colors container can all be defined in the same file:

Containers.js

```jsx
import React from 'react';
import { PropTypes } from 'prop-types';
import AddColorForm from './ui/AddColorForm';
import SortMenu from './ui/SortMenu';
import ColorList from './ui/ColorList';
import { addColor, sortColors, rateColor, removeColor } from '../redux/actions.color';
import { sortFunction } from '../utils/arrayHelper';

export const NewColor = (props, { store }) =>
  <AddColorForm onNewColor={(title, color) =>
    store.dispatch(addColor(title, color))
  } />;

NewColor.contextTypes = {
  store: PropTypes.object
};

export const Menu = (props, { store }) =>
  <SortMenu sort={store.getState().sort}
    onSelect={sortBy =>
      store.dispatch(sortColors(sortBy))
    } />;

Menu.contextTypes = {
  store: PropTypes.object
};

export const Colors = (props, { store }) => {
  const { colors, sort } = store.getState();
  const sortedColors = [...colors].sort(sortFunction(sort));
  return (
    <ColorList colors={sortedColors}
      onRemove={id =>
        store.dispatch(removeColor(id))
      }
      onRate={(id, rating) =>
        store.dispatch(rateColor(id, rating))
      } />
  );
};

Colors.contextTypes = {
  store: PropTypes.object
};
```

The NewColor container does not render UI. Instead, it renders the AddColorForm component and handles onNewColor events from this component. This container component retrieves the store from the context and uses it to dispatch ADD_COLOR actions. It contains the AddColorForm component and connects it to the Redux store.

The Menu container renders the SortMenu component. It passes the current sort property from the store’s state and dispatches sort actions when the user selects a different menu item.

The Colors container retrieves the store via context and renders a ColorList component with colors from the store’s current state. It also handles onRate and onRemove events invoked from the ColorList component. When these events occur, the Colors container dispatches the appropriate actions.

All of the Redux functionality is connected here in this file. Notice that **all of the action creators are being imported and used in one place. This is the only file that invokes `store.getState` or `store.dispatch`.**

_This approach of separating UI components from containers that connect them to data is generally a good approach. However, this could be overkill for a small project_, proof of concept, or prototype.

Next level is about a new library, React Redux. This library can be used to quickly add the Redux store to context and create container components.
