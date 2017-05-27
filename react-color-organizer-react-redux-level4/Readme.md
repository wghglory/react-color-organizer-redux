## The React Redux Provider (Level 4)

React Redux is a library that contains some tools to help ease the complexity involved with implicitly passing the store via context. Redux does not require that you use this library. However, using React Redux reduces your code’s complexity and may help you build apps a bit faster.

In order to use React Redux, we must first install it. It can be installed via npm:

```bash
npm install react-redux --save
```

react-redux supplies us with a component that we can use to set up our store in the context, the provider. We can wrap any React element with the `provider` and that element’s children will have access to the store via context.

Instead of setting up the store as a context variable in the App component, we can keep the App component stateless:

```jsx
// App.js
import { Menu, NewColor, Colors } from './Containers'

const App = () =>
    <div className="app">
        <Menu />
        <NewColor />
        <Colors />
    </div>

export default App
```

The provider adds the store to the context and updates the App component when actions have been dispatched. The provider expects a single child component:

```jsx
// index.js
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import App from './components/App'
import storeFactory from './store'

const store = storeFactory()

render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('app')
)
```

The provider requires that we pass the store as a property. It **adds the store to the context** so that it can be retrieved by any child of the App component. Simply using the provider can save us some time and simplify our code.

Once we’ve incorporated the provider, we can retrieve the store via context in child container components. However, React Redux provides us with another way to quickly create container components that work with the provider: the connect function.

## React Redux connect

**If we keep our UI components purely presentational, we can rely on React Redux to create the container components. React Redux helps us create container components through mapping the current state of the Redux store to the properties of a presentational component. It also maps the store’s dispatch function to callback properties. This is all accomplished through a higher-order function called `connect`.**

Let’s create the Colors container component using connect. The Colors container connects the ColorList component to the store:

```javascript
import ColorList from './ColorList'

const mapStateToProps = state =>
    ({
        colors: [...state.colors].sort(sortFunction(state.sort))
    })

const mapDispatchToProps = dispatch =>
    ({
        onRemove(id) {
            dispatch(removeColor(id))
        },
        onRate(id, rating) {
            dispatch(rateColor(id, rating))
        }
    })

export const Colors = connect(
    mapStateToProps,
    mapDispatchToProps
)(ColorList)
```

**connect is a higher-order function that returns a function that returns a component. connect expects two arguments: `mapStateToProps` and `mapDispatchToProps`. Both are functions. It returns a function that expects a presentational component, and wraps it with a container that sends it data via props.**

The first function, mapStateToProps, injects state as an argument and returns an object that will be mapped to props. We set the colors property of the ColorList component to an array of sorted colors from state.

The second function, mapDispatchToProps, injects the store’s dispatch function as an argument that can be used when the ColorList component invokes callback function properties. When the ColorList raises onRate or onRemove events, data about the color to rate or remove is obtained and dispatched.

**connect works in conjunction with the provider. The provider adds the store to the context and connect creates components that retrieve the store. When using connect, you do not have to worry about context**.

All of our containers can be created using the React Redux connect function in a single file:

```javascript

import { connect } from 'react-redux'
import AddColorForm from './ui/AddColorForm'
import SortMenu from './ui/SortMenu'
import ColorList from './ui/ColorList'
import { addColor, 
         sortColors, 
         rateColor, 
         removeColor } from '../actions'
import { sortFunction } from '../lib/array-helpers'

export const NewColor = connect(
    null,
    dispatch =>
        ({
            onNewColor(title, color) {
                dispatch(addColor(title,color))
            }
        })
)(AddColorForm)

export const Menu = connect(
    state =>
        ({
            sort: state.sort
        }),
    dispatch =>
        ({
            onSelect(sortBy) {
                dispatch(sortColors(sortBy))
            }
        })
)(SortMenu)

export const Colors = connect(
    state =>
        ({
            colors: [...state.colors].sort(sortFunction(state.sort))
        }),
    dispatch =>
        ({
            onRemove(id) {
                dispatch(removeColor(id))
            },
            onRate(id, rating) {
                dispatch(rateColor(id, rating))
            }
        })
)(ColorList)
```

In this example, each of our containers are defined using React Redux’s connect function. The connect function connects Redux to purely presentational components. The first argument is a function that maps state variables to properties. The second argument is a function that dispatches actions when events are raised. If you only want to map callback function properties to dispatch you can provide null as a placeholder for the first argument, as we have in the definition of the NewColor container.