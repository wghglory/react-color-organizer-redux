# Color Organizer React Redux

The Color Organizer allows users to add, name, rate, and remove colors from their customized list. The entire state of the color organizer can be represented with a single array.

```javascript
{
    colors: [
        {
            "id": "0175d1f0-a8c6-41bf-8d02-df5734d829a4",
            "title": "ocean at dusk",
            "color": "#00c4e2",
            "rating": 5
        },
        {
            "id": "83c7ba2f-7392-4d7d-9e23-35adbe186046",
            "title": "lawn",
            "color": "#26ac56",
            "rating": 3
        },
        {
            "id": "a11e3995-b0bd-4d58-8c48-5e49ae7f7f23",
            "title": "bright red",
            "color": "#ff0000",
            "rating": 0
        }
    ]
}
```

## ways to connect Redux to React

* level 1: We explicitly passed the store down the component tree to children as a property. 
* level 2: We implicitly passed the store directly to the components that need to use it via context. 
* level 3: We decoupled the store’s functionality from our presentation through the use of container components. 
* level 4: we used react-redux to help us rapidly connect the store to presentation using context and container components.

* react-color-organizer-react-redux-test: level 4 + test
* react-color-organizer-react-router: level 4 + react router (sort based on url)
---

#### Installation
Run this npm command to install dependencies.
```
npm install
```

#### Build
Run this npm command to build the JavaScript Bundle for production
```
npm run build
```

#### Run
Run this npm command to build the JavaScript Bundle and open the browser to the app using the file api.
```
npm start
```