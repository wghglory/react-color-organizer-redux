# Universal React Redux Application Color Organizer

### Express server

First, we’ll need a module that configures an Express application instance, so let’s create *./server/app.js*:

```javascript
import express from 'express'
import path from 'path'
import fs from 'fs'

const fileAssets = express.static(
    path.join(__dirname, '../../dist/assets')
)

const logger = (req, res, next) => {
    console.log(`${req.method} request for '${req.url}'`)
    next()
}

const respond = (req, res) =>
    res.status(200).send(`
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>Universal Color Organizer</title>
    </head>
    <body>
        <div id="react-container">ready...</div>
    </body>
</html>
    `)

export default express()
    .use(logger)
    .use(fileAssets)
    .use(respond)
```

This module is the starting point for our universal application. The Express configuration uses middleware for logging and file assets, and eventually it responds to every request with an HTML page.

> NOTE:  we are serving HTML directly from this file, you’ll need to remove the *./dist/index.html* file. If this file remains in place, it will be served before the `response` is reached.

### css ignore in node.js

Webpack allows us to import assets like CSS or image files, but Node.js will not know how to handle those imports. We’ll need to use the `ignore-styles` library to make sure that we are ignoring any SCSS import statements. Let’s install `ignore-styles`:

```
npm install ignore-styles --save
```

In the *server/index.js* file, we will consume the Express app instance and start the server. This file represents the entry point for our Node.js server:

```javascript
import React from 'react'
import ignoreStyles from 'ignore-styles'
import app from './app'

global.React = React

app.set('port', process.env.PORT || 3000)
    .listen(
        app.get('port'),
        () => console.log('Color Organizer running')
    )
```

This file adds React to the global instance and starts the server. Additionally, we’ve included the `ignore-styles` module, which ignores those imports so we can render components in Node.js without causing errors.

We now have a starting point: a basic Express app configuration. Any time we need to include new features on the server, they will need to make their way into this app configuration module.

## Universal Redux

All of the JavaScript in the Redux library is universal. Your reducers are written in JavaScript and should not contain code that depends upon any environment. Redux was designed to be used as a state container for browser applications, but it can be used in all types of Node.js applications, including CLIs, servers, and native applications, too.

We already have the code in place for the Redux store. We’ll use this store to save state changes to a JSON file on the server.

First, we need to modify the `storeFactory` so that it can work isomorphically. At present, the `storeFactory` includes logging middleware that will cause errors in Node.js because it utilizes the `console.groupCollapsed` and `console.groupEnd` methods. Neither of these methods are available in Node.js. If we create stores on the server, we’ll need to use a different logger:

```javascript
// storeFactory.js
import { colors } from './reducers'
import { 
    createStore, combineReducers, applyMiddleware 
} from 'redux'


const clientLogger = store => next => action => {
    let result
    console.groupCollapsed("dispatching", action.type)
    console.log('prev state', store.getState())
    console.log('action', action)
    result = next(action)
    console.log('next state', store.getState())
    console.groupEnd()
    return result
}

const serverLogger = store => next => action => {
    console.log('\n  dispatching server action\n')
    console.log(action)
    console.log('\n')
    return next(action)
}

const middleware = server => 
    (server) ? serverLogger : clientLogger

const storeFactory = (server = false, initialState = {}) =>
    applyMiddleware(middleware)(createStore)(
        combineReducers({colors}),
        initialState
    )

export default storeFactory
```

Now the `storeFactory` is isomorphic. We created Redux middleware for logging actions on the server. When the `storeFactory` is invoked, we’ll tell it which type of store we want and the appropriate logger will be added to the new store instance.

Let’s now use this isomorphic `storeFactory` to create a `serverStore` instance. At the top of the Express configuration, we’ll need to import the `storeFactory` and the initial state data. We can use the `storeFactory` to create a store with initial state from a JSON file:

```javascript
// server/app.js
import storeFactory from '../app/store/storeFactory'
import initialState from '../data/initialState.json'

const serverStore = storeFactory(true, initialState)
```

Now we have an instance of the store that will run on the server.

Every time an action is dispatched to this instance, we want to make sure the *initialState.json* file is updated. Using the `subscribe` method, we can listen for state changes and save a new JSON file every time the state changes:

```javascript
serverStore.subscribe(() => 
    fs.writeFile(
        path.join(__dirname, '../app/data/initialState.json'),
        JSON.stringify(serverStore.getState()),
        error => (error) ?
            console.log("Error saving state!", error) :
            null
    )
)
```

As actions are dispatched, the new state is saved to the *initialState.json* file using the `fs` module.

The `serverStore` is now the main source of truth. Any request will need to communicate with it in order to get the current and most up-to-date list of colors. We’ll add some middleware that will add the server store to the request pipeline so that it can be used by other middleware during a request:

```javascript
// server/app.js
const addStoreToRequestPipeline = (req, res, next) => {
    req.store = serverStore
    next()
}

export default express()
    .use(logger)
    .use(fileAssets)
    .use(addStoreToRequestPipeline)
    .use(htmlResponse)
```

Now any middleware method that comes after `addStoreToRequestPipeline` will have access to the store on the `request` object. We have used Redux universally. The exact same code for the store, including our reducers, will run in multiple environments.

## Universal Routing

In the last chapter, we added the `react-router-dom` to the color organizer. The router decides which component to render based on the browser’s current location. The router can be rendered on the server as well—we just need to provide the location or route.

So far, we’ve used the `HashRouter`. The router automatically adds a `#` before each route. To use the router isomorphically, we need to replace the `HashRouter` with the `BrowserRouter`, which removes the preceding `#` from our routes.

When we render our application, we need to replace the `HashRouter` with the `BrowserRouter`:

```Jsx
// app/index.js
import { BrowserRouter } from 'react-router-dom'

...

render(
    <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
    </Provider>,
    document.getElementById('react-container')
)
```

Now the color organizer is no longer prefacing each route with a hash. At this point, the organizer still works. Start it up and select one color. The `Color` container is rendered, and it changes the background of the entire screen using the `ColorDetails` component.

The location bar should now look something like:

```
http://localhost:3000/8658c1d0-9eda-4a90-95e1-8001e8eb6036
```

There is no longer a # in front of the route. Now let’s refresh the page in the browser:

```
Cannot GET /8658c1d0-9eda-4a90-95e1-8001e8eb6036
```

Refreshing the page causes the browser to send a GET request to the server using the current route. The `#` was used to prevent us from sending that GET request. We use the `BrowserRouter` because we want the GET request to be sent to the server. In order to render the router on the server, we need a location—we need the route. This route will be used on the server to tell the router to render the `Color` container. The `BrowserRouter` is used when you want to render routes isomorphically.

Now that we know what content the user is requesting, let’s use it to render the UI on the server. In order to render the router on the server, we’ll have to make some significant changes to our Express configuration. To start, we’ll need to import a few modules:

```javascript
// server/app.js
import { Provider } from 'react-redux'
import { compose } from 'redux'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
```

We need the `Provider`, a `compose` function, the `renderToString` function, and the `StaticRouter`. On the server, the StaticRouter is used when we want to render our component tree to a string.

In order to generate an HTML response, there are three steps:

1. Create a store that runs on the client using the data from the `serverStore`.
2. Render the component tree as HTML using the `StaticRouter`.
3. Create the HTML page that will be sent to the client.

We create one function for each of these steps and compose them into a single function, the `htmlResponse`:

```javascript
const htmlResponse = compose(
    buildHTMLPage,                    // Step 3
    renderComponentsToHTML,           // Step 2
    makeClientStoreFrom(serverStore)  // Step 1
)
```

In this composition, the `makeClientStoreFrom(serverStore)` is a higher-order function. Initially, this function is invoked with the `serverStore` once. It returns a function that will be invoked on every request. The returned function will always have access to the `serverStore`.

When `htmlResponse` is invoked, it expects a single argument: the `url` that has been requested by the user. For step one, we will create a higher-order function that packages the `url` with a new client `store` created using the current state of the `serverStore`. Both `store` and `url` are passed to the next function, step 2, in a single object:

```javascript
const makeClientStoreFrom = store => url =>
    ({
        store: storeFactory(false, store.getState()),
        url
    })
```

The output from the `makeClientStoreFrom` function becomes the input for the `renderComponentToHTML` function. This function expects that the `url` and store have been packaged into a single argument:

```javascript
const renderComponentsToHTML = ({url, store}) =>
    ({
        state: store.getState(),
        html: renderToString(
            <Provider store={store}>
                <StaticRouter location={url} context={{}}>
                    <App />
                </StaticRouter>
            </Provider>
        )
    })
```

The `renderComponentsToHTML` returns an object with two properties: `state` and `html`. The `state` is obtained from the new client store and the `html` is generated by the `renderToString` method. Since the app still uses Redux in the browser, the `Provider` is rendered as the root component, and the new client store is passed to it as a property.

The `StaticRouter` component is used to render the UI based upon the location that is being requested. The `StaticRouter` requires a `location` and `context`. The requested `url` is passed to the `location` property and an empty object is passed to `context`. When these components are rendered to an HTML string, the location will be taken into account, and the `StaticRouter` will render the correct routes.

This function returns the two necessary components to build the page: the current state of the organizer, and the UI rendered to an HTML string.

The `state` and the `html` can be used in the last composed function, `buildHTMLPage`:

```javascript
const buildHTMLPage = ({html, state}) => `
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>Universal Color Organizer</title>
    </head>
    <body>
        <div id="app">${html}</div>
        <script>
            window.__INITIAL_STATE__ = ${JSON.stringify(state)}
        </script>
        <script src="/bundle.js"></script>
    </body>
</html>
`
```

Our color wall is now isomorphic. It will render the UI on the server and send it to the client as text. It will also embed the initial state of the store directly into the response.

The browser initially displays the UI obtained in the HTML response. When the bundle loads, it re-renders the UI and the client takes over from there. From this point on, all user interactivity including navigation will happen on the client. Our single page application will function as it always has, unless the browser is refreshed, at which point the server rendering process starts all over again.

Here is all of the current code from the Express app module, the entire file:

```javascript
import express from 'express'
import path from 'path'
import fs from 'fs'
import { Provider } from 'react-redux'
import { compose } from 'redux'
import { StaticRouter } from 'react-router-dom'
import { renderToString } from 'react-dom/server'
import App from '../components/App'
import storeFactory from '../store'
import initialState from '../../data/initialState.json'

const fileAssets = express.static(
    path.join(__dirname, '../dist/assets')
)

const serverStore = storeFactory(true, initialState)

serverStore.subscribe(() => 
    fs.writeFile(
        path.join(__dirname, '../../data/initialState.json'),
        JSON.stringify(serverStore.getState()),
        error => (error) ? 
            console.log("Error saving state!", error) : 
            null
    )
)

const logger = (req, res, next) => {
    console.log(`${req.method} request for '${req.url}'`)
    next()
}

const addStoreToRequestPipeline = (req, res, next) => {
    req.store = serverStore
    next()
}

const makeClientStoreFrom = store => url =>
    ({
        store: storeFactory(false, store.getState()),
        url
    })

const renderComponentsToHTML = ({url, store}) =>
    ({
        state: store.getState(),
        css: defaultStyles,
        html: renderToString(
            <Provider store={store}>
                <StaticRouter location={url} context={{}}>
                    <App />
                </StaticRouter>
            </Provider>
        )
    })

const buildHTMLPage = ({html, state}) => `
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>Universal Color Organizer</title>
    </head>
    <body>
        <div id="react-container">${html}</div>
        <script>
            window.__INITIAL_STATE__ = ${JSON.stringify(state)}
        </script>
        <script src="/bundle.js"></script>
    </body>
</html>
`

const htmlResponse = compose(
    buildHTMLPage,
    renderComponentsToHTML,
    makeClientStoreFrom(serverStore)
)

const respond = (req, res) =>
    res.status(200).send(htmlResponse(req.url))

export default express()
    .use(logger)
    .use(fileAssets)
    .use(addStoreToRequestPipeline)
    .use(respond)
```

Our app now allows users to bookmark URLs and send URLs to other users that will be rendered isomorphically. The router decides which content to render based upon the URL. It does so on the server, which means that our users can access our content rapidly.

Isomorphic applications have the best of both worlds: ==**they can take advantage of the speediness, control, and security that server rendering provides, while benefiting from the low bandwidth and speed that is gained from single page applications. An isomorphic React application is essentially a server-rendered SPA, which lays the foundation for you to build efficient applications that will be cool but also fast and efficient.**==

### INCORPORATING SERVER-RENDERED STYLES

At present, we are rendering the HTML on the server, but the CSS does not get rendered until the bundle is loaded in the browser. The result is a strange flicker. Initially we will see all of the unstyled content in the browser before the CSS is loaded. When JavaScript is turned off in the browser, users will not see any CSS styles at all because they are embedded in the JavaScript bundle.

The solution is to add the styles directly to the response. To do this, we must first extract the CSS from the webpack bundle into its own separate file. You will need to install the `extract-text-webpack-plugin`:

```
npm install extract-text-webpack-plugin
```

You will also need to require this plugin in your webpack configuration:

```javascript
var webpack = require("webpack")
var ExtractTextPlugin = require("extract-text-webpack-plugin")
var OptimizeCss = require('optimize-css-assets-webpack-plugin')
```

Also, in the webpack configuration, we need to replace the CSS and SCSS loaders with loaders that use the `ExtractTextPlugin`:

```javascript
{
    test: /\.css$/,
    loader: ExtractTextPlugin.extract({
        fallback: "style-loader",
        use: [
            "style-loader", 
            "css-loader", 
            {
                loader: "postcss-loader",
                options: {
                    plugins: () => [require("autoprefixer")]
                }
            }
        ]
    })
},
{
    test: /\.scss/,
    loader: ExtractTextPlugin.extract({
        fallback: "style-loader",
        use: [
            "css-loader",
            {
                loader: "postcss-loader",
                options: {
                    plugins: () => [require("autoprefixer")]
                }
            }, 
            "sass-loader"
        ]
    })
}
```

And we need to include that plugin in our configuration inside of the plugins array. Here, when the plugin is included, we specify the filename of the CSS file to extract:

```javascript
plugins: [
    new ExtractTextPlugin("bundle.css"),
    new OptimizeCss({
        assetNameRegExp: /\.optimize\.css$/g,
        cssProcessor: require('cssnano'),
        cssProcessorOptions: {
            discardComments: {removeAll: true}
        },
        canPrint: true
    })
]
```

Now when webpack runs, it will not include the CSS in the JavaScript bundle; it will instead extract all of the CSS into a separate file, *./assets/bundle.css*.

We also need to modify the Express configuration. When the organizer starts, the CSS is saved as a global string. We can use the filesystem or `fs` module to read the contents of a text file into the variable `staticCSS`:

```javascript
const staticCSS = fs.readFileSync(
    path.join(__dirname, '../dist/assets/bundle.css')
)
```

Now we have to modify the `buildHTMLPage` function to write the CSS directly to the response inside of a `<style>` tag:

```javascript
const buildHTMLPage = ({html, state}) => `
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>Universal Color Organizer</title>
        <style>${staticCSS}</style>
    </head>
    <body>
        <div id="react-container">${html}</div>
        <script>
            window.__INITIAL_STATE__ = ${JSON.stringify(state)}
        </script>
        <script src="/bundle.js"></script>
    </body>
</html>
`
```

CSS is now directly embedded into our response. There is no longer a strange, styleless flicker. When JavaScript is turned off, the styles remain in place.

We now have an isomorphic color organizer that shares a lot of universal JavaScript. Initially, the color organizer is rendered on the server, but it is also rendered on the browser after the page is finished loading. When the browser takes over, the color organizer behaves as a single-page application.

# Communicating with the Server

At present, the color organizer is rendering UI on the server and re-rendering UI in the browser. Once the browser takes over, the organizer functions as a single-page application. Users dispatch actions locally, the local state changes, and locally the UI is updated. Everything is working well in the browser, but the dispatched actions are not making it back to the server.

In this next section, we will not only make sure that this data gets saved on the server, we will make sure that the action objects themselves are created on the server and dispatched to both stores.

## Completing Actions on the Server

In the color organizer, we will integrate a REST API for handling our data. Actions will be initiated on the client, completed on the server, and then dispatched to both stores. The `serverStore` will save the new state to JSON, and the client store will trigger a UI update. Both stores will dispatch the same actions universally.

<img src="http://om1o84p1p.bkt.clouddn.com/1496620331.png" title="flow"/>

Let’s take a look at an example of the complete process for dispatching an `ADD_COLOR` action in the proposed solution:

1. Dispatch action creator `addColor()` with new title and color.
2. Send data to server in new POST request.
3. Create and dispatch the new `ADD_COLOR` add color action on the server.
4. Send the `ADD_COLOR` action in the response body.
5. Parse the response body and dispatch the `ADD_COLOR` action on the client.

The first thing that we need to do is build the REST API. Let’s create a new file called *./server/color.api.js*.

Every action created is handled the same way: it is dispatched on the server and then it is sent to the client. Let’s create a function that dispatches the action to the `serverStore` and sends the action to the client using the response object:

```javascript
// ./server/color.api.js
const dispatchAndRespond = (req, res, action) => {
    req.store.dispatch(action)
    res.status(200).json(action)
}
```

Once we have an action, we can use this function to dispatch the action and send a response to the client.

We will need to create some HTTP endpoints using the Express `Router` that can handle various HTTP requests. We will create routes to handle `GET`, `POST`, `PUT`, and `DELETE` requests on the route */api/colors*. The Express `Router` can be used to create these routes. Each route will contain the logic to create a different action object and send it to the `dispatchAndRespond` function along with the request and response objects:

```javascript
import { Router } from 'express'
import { v4 } from 'uuid'

const dispatchAndRespond = (req, res, action) => {
    req.store.dispatch(action)
    res.status(200).json(action)
}

const router = Router()

router.get("/colors", (req, res) =>
    res.status(200).json(req.store.getState().colors)
)

router.post("/colors", (req, res) =>
    dispatchAndRespond(req, res, {
        type: "ADD_COLOR",
        id: v4(),
        title: req.body.title,
        color: req.body.color,
        timestamp: new Date().toString()
    })
)

router.put("/color/:id", (req, res) =>
    dispatchAndRespond(req, res, {
        type: "RATE_COLOR",
        id: req.params.id,
        rating: parseInt(req.body.rating)
    })
)

router.delete("/color/:id", (req, res) =>
    dispatchAndRespond(req, res, {
        type: "REMOVE_COLOR",
        id: req.params.id
    })
)

export default router
```

Each function added to the router object handles a different request for *http://localhost:3000/api/{route}*:

- `GET '/colors'`

  Responds with the current color array from the server’s state. This route is added just so we can see the listed colors; it is not used by the frontend.

- `POST '/colors'`

  Creates a new color action object and sends it to `dispatchAndRespond`.

- `PUT '/color/:id'`

  Changes the rating of a color. The color’s ID is obtained from route paramaters and used in the new action object.

- `DELETE '/color/:id'`

  Removes a color based upon the ID sent in the routing parameters.

Now that we have defined the routes, we need to add them to the Express app configuration. First, we install the Express `body-parser`:

```
npm install body-parser --save
```

The `body-parser` is used to parse incoming request bodies and obtain any variables sent to the routes. It is necessary to obtain the new color and rating information from the client. We’ll need to add this middleware to our Express app configuration. Let’s import the `body-parser` and our new routes into the *./server/app.js* file:

```javascript
import bodyParser from 'body-parser'
import api from './color.api'
```

Let’s add the `bodyParser` middleware and the API to our Express app. It is important to add the `bodyParser` before the API so that the data can be parsed by the time the request has been handled by the API:

```javascript
export default express()
    .use(logger)
    .use(fileAssets)
    .use(bodyParser.json())
    .use(addStoreToRequestPipeline)
    .use('/api', api)
    .use(matchRoutes)
```

The `bodyParser.json()` is now parsing incoming request bodies that have been formatted as JSON. Our `color.api` is added to the pipeline and configured to respond to any routes that are prefixed with */api*. For example, this URL can be used to obtain the current array of colors as JSON: *http://localhost:3000/api/colors*.

Now that our Express app has endpoints that can respond to HTTP requests, we are ready to modify the frontend action creators to communicate with these endpoints.

## Actions with Redux Thunks

One problem with client/server communication is latency, or the delay that we experience while waiting for a response after sending a request. Our action creators need to wait for a response before they can dispatch the action, because in our solution the action itself is being sent to the client from the server. There is middleware for Redux that can help us with asynchronous actions: it is called `redux-thunk`.

In this next section, we will rewrite out action creators using `redux-thunk`. These action creators, called thunks, will allow us to wait for a server response before dispatching an action locally. Thunks are higher-order functions. Instead of action objects, they return other functions. Let’s install `redux-thunk`:

```
npm install redux-thunk --save
```

`redux-thunk` is middleware; it needs to be incorporated into our `storeFactory`. First, at the top of *./app/store/storeFactory.js*, import `redux-thunk`:

```
import thunk from 'redux-thunk'
```

The `storeFactory` has a function called middleware. It returns the middleware that should be incorporated to the new store in a single array. We can add any Redux middleware to this array. Each item will be spread into the arguments of the `applyMiddleware` function:

```javascript
const middleware = server => [
    (server) ? serverLogger : clientLogger,
    thunk
]

const storeFactory = (server = false, initialState = {}) =>
    applyMiddleware(...middleware(server))(createStore)(
        combineReducers({colors}),
        initialState
    )

export default storeFactory
```

Let’s take a look at the current action creator for adding colors:

```javascript
export const addColor = (title, color) =>
    ({
        type: "ADD_COLOR",
        id: v4(),
        title,
        color,
        timestamp: new Date().toString()
    })

...

store.dispatch(addColor("jet", "#000000"))
```

This action creator returns an object, the `addColor` action. That object is immediately dispatched to the store. Now let’s look at the thunk version of `addColor`:

```javascript
export const addColor = (title, color) => 
    (dispatch, getState) => {
    
        setTimeout(() => 
            dispatch({ 
                type: "ADD_COLOR",
                index: getState().colors.length + 1,
                timestamp: new Date().toString()
                title, 
                color
            }),
            2000
        )
    }

...

store.dispatch(addColor("jet", "#000000"))
```

Even though both action creators are dispatched the exact same way, the thunk returns a function instead of an action. The returned function is a callback that receives the store’s `dispatch` and `getState` methods as arguments. We can dispatch an action when we are ready. In this example, a `setTimeout` is used to create a two-second delay before we dispatch a new color action.

In addition to `dispatch`, thunks also have access to the store’s `getState` method. In this example, we used it to create an index field based upon the current number of colors in state. This function can be useful when it is time to create actions that depend upon data from the store.

> NOTE: Not all of your action creators have to be thunks. The `redux-thunk` middleware knows the difference between thunks and action objects. Action objects are immediately dispatched.

Thunks have another benefit. They can invoke `dispatch` or `getState` asynchronously as many times as they like, and they are not limited to dispatching one type of action. In this next sample, the thunk immediately dispatches a `RANDOM_RATING_STARTED` action and repeatedly dispatches a `RATE_COLOR` action that rates a specific color at random:

```javascript
export const rateColor = id =>
    (dispatch, getState) => {
    
        dispatch({ type: "RANDOM_RATING_STARTED" })
        setInterval(() =>
            dispatch({
                type: "RATE_COLOR",
                id,
                rating: Math.floor(Math.random()*5)
            }),
            1000
        )
    }

...

store.dispatch(
    rateColor("f9005b4e-975e-433d-a646-79df172e1dbb")
)
```

These thunks are simply samples. Let’s build the real thunks that the color organizer will use by replacing our current action creators.

------

First, we’ll create a function called `fetchThenDispatch`. This function uses `isomorphic-fetch` to send a request to a web service and automatically dispatch the response:

```javascript
import fetch from 'isomorphic-fetch'

const parseResponse = response => response.json()

const logError = error => console.error(error)

const fetchThenDispatch = (dispatch, url, method, body) =>
    fetch(
        url, 
        {
            method, 
            body, 
            headers: { 'Content-Type': 'application/json' }
        }
    ).then(parseResponse)
     .then(dispatch)
     .catch(logError)
```

The `fetchThenDispatch` function requires the `dispatch` function, a URL, the HTTP request method, and the HTTP request body as arguments. This information is then used in the `fetch` function. Once a response is received, it will be parsed and then dispatched. Any error will be logged to the console.

We’ll use the `fetchThenDispatch` function to help us construct thunks. Each thunk will send a request to our API, along with any necessary data. Since our API responds with action objects, the response can be immediately parsed and dispatched:

```javascript
export const addColor = (title, color) => dispatch =>
    fetchThenDispatch(
        dispatch,
        '/api/colors',
        'POST',
        JSON.stringify({title, color})
    )

export const removeColor = id => dispatch =>
    fetchThenDispatch(
        dispatch,
        `/api/color/${id}`,
        'DELETE'
    )

export const rateColor = (id, rating) => dispatch =>
    fetchThenDispatch(
        dispatch,
        `/api/color/${id}`,
        'PUT',
        JSON.stringify({rating})
    )
```

The `addColor` thunk sends a POST request to *http://localhost:3000/api/colors* along with the title and hex value of the new color. An `ADD_COLOR` action object is returned, parsed, and dispatched.

The `removeColor` thunk sends a DELETE request to the API with the ID of the color to delete provided in the URL. A `REMOVE_COLOR` action object is returned, parsed, and dispatched.

The `rateColor` thunk sends a PUT request to the API. The ID of the color to rate is included in the URL as a route parameter, and the new rating is supplied in the body of the request. A `RATE_COLOR` action object is returned from the server, parsed as JSON, and dispatched to the local store.

Now when you run the application, you can see actions being dispatched to both stores in the console log. The browser console is a part of the developer tools and the server console is the terminal where the server was started.

##### USING THUNKS WITH WEBSOCKETS

The color organizer uses REST to communicate with the server. Thunks can also be used with *websockets* to send and receive. Websockets are two-way connections between the client and the server. Websockets can send data to a server, but they also allow the server to send data to the client.

One way to work with websockets and thunks is to dispatch a `connect` action creator. For example, let’s say we wanted to connect to a message server:

```javascript
store.dispatch(connectToMessageSocket())
```

Thunks can invoke dispatch as much as they want. We can create thunks that listen for incoming messages and dispatch `NEW_MESSAGE` actions when they are received. This next sample uses `socket.io-client` to connect to a socket.io server and listen for incoming messages:

```javascript
import io from 'socket.io-client'

const connectToChatSocket = () => dispatch => {
    
    dispatch({type: "CONNECTING"})

    let socket = io('/message-socket')

    socket.on('connect', () => 
        dispatch({type: "CONNECTED", id: socket.id})
    )

    socket.on('message', (message, user) => 
        dispatch({type: "NEW_MESSAGE", message, user})
    )
    
}

export default connectToMessageSocket
```

As soon as the `connectToChatSocket` is invoked, a `CONNECTING` action is dispatched. We then attempt to connect to the message socket. Once connected, the socket will respond with a connect event. When this happens, we can dispatch a `CONNECTED` action with information about the current socket.

When the server sends new messages, message events are raised on the socket. We can dispatch `NEW_MESSAGE` actions locally every time they are sent to this client from the server.

Thunks can work with any type of asynchronous process, including websockets, socket-io, Firebase, setTimeouts, transitions, and animations.

Just about every React application that you build will require the existence of some type of web server. Sometimes you will only need a web server to host your application. Other situations require communications with web services. And then there are high-traffic applications that need to work on many platforms that will require different solutions entirely.

##### ADVANCED DATA FETCHING

If you are working on high-traffic applications that share data on multiple platforms, you may want to look into frameworks like *Relay and GraphQL or Falcor*. These frameworks provide more efficient and intelligent solutions for providing applications with only the data that they require.

[GraphQL](http://graphql.org/) is a declarative data querying solution developed at Facebook that can be used to query data from multiple sources. GraphQL can be used by all types of languages and platforms. [Relay](https://facebook.github.io/relay/) is a library, also developed at Facebook, that handles data fetching for client applications by linking GraphQL queries with React or React Native components. There is a bit of learning curve associated with GraphQL and Relay, but it is well worth it if you really like declarative programming.

[Falcor](https://netflix.github.io/falcor/) is a framework developed at Netflix that also addresses issues associated with fetching and efficiently using data. Like GraphQL, Falcor allows you to query data from multiple services in a single location. However, Falcor uses JavaScript to query data, which likely means less of a learning curve for JavaScript developers.

### Sum

If your application does not depend upon a lot of data, don’t use Redux. React state is a great solution that is perfect fit for the right size app. Your application may not require server rendering. Don’t worry about incorporating it until you have a highly interactive app that has a lot of mobile traffic.