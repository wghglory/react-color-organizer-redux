# The React Redux Testing

<!-- TOC -->

- [The React Redux Testing](#the-react-redux-testing)
  - [Jest](#jest)
  - [Testing Reducers](#testing-reducers)
    - [deep-freeze](#deep-freeze)
  - [Testing the Store](#testing-the-store)
  - [Testing React Components](#testing-react-components)
    - [Setting Up the Jest Environment](#setting-up-the-jest-environment)
      - [global file](#global-file)
      - [IGNORING SCSS IMPORTS](#ignoring-scss-imports)
      - [Enzyme](#enzyme)
      - [Mocking Components](#mocking-components)
  - [Testing Hocs](#testing-hocs)
      - [Jest Mocks](#jest-mocks)
  - [Manual Mocks](#manual-mocks)
  - [Snapshot Testing](#snapshot-testing)
  - [Using Code Coverage](#using-code-coverage)

<!-- /TOC -->

## Jest

_Jest will run any tests found in the `__tests__` directory, and any JavaScript files in your project whose names end with `.test.js`_. Some developers prefer to place their tests directly next to the files they are testing, while others prefer to group their tests in a single folder.

Before we can get started writing tests, we will need to install a testing framework. You can write tests for React and Redux with any JavaScript testing framework. We're using **Jest**:

```
sudo npm install -g jest
```

Since we are using emerging JavaScript and React, we will need to transpile our code and our tests before they can run. Just install the **babel-jest** package to make that possible:

```
npm install --save-dev babel-jest
```

With babel-jest installed, all of your code and tests will be transpiled with Babel before the tests run. A **.babelrc** file is required for this to work.

> Note: CREATE-REACT-APP
> Projects that were initialized with create-react-app already come with the jest and babel-jest packages installed. They also create a `__tests__` directory in the root of the project.

Jest has two important functions for setting up tests: describe and it. describe is used to create a suite of tests, and it is used for each test. Both functions expect the name of the test or suite and a callback function that contains the test or suite of tests.

## Testing Reducers

Let’s create a test file and stub our tests. Create a folder called `./__tests__/reducers`.

```javascript
// reducer.color.test.js
import C from '../../app/constants/constants.color';
import { colorReducer } from '../../app/reducers/reducer.color';
import deepFreeze from 'deep-freeze';

describe("color Reducer", () => {

  it("ADD_COLOR success", () => {
    const state = {};
    const action = {
      type: C.ADD_COLOR,
      id: 0,
      title: 'Test Teal',
      color: '#90C3D4',
      timestamp: new Date().toString()
    };
    deepFreeze(state);
    deepFreeze(action);
    const result = colorReducer(state, action);
    expect(result)
      .toEqual({
        id: 0,
        title: 'Test Teal',
        color: '#90C3D4',
        timestamp: action.timestamp,
        rating: 0
      });
  });

  it("RATE_COLOR success", () => {
    const state = {
      id: 0,
      title: 'Test Teal',
      color: '#90C3D4',
      timestamp: 'Sat Mar 12 2016 16:12:09 GMT-0800 (PST)',
      rating: undefined
    };
    const action = {
      type: C.RATE_COLOR,
      id: 0,
      rating: 3
    };
    deepFreeze(state);
    deepFreeze(action);
    const result = colorReducer(state, action);
    expect(result)
      .toEqual({
        id: 0,
        title: 'Test Teal',
        color: '#90C3D4',
        timestamp: 'Sat Mar 12 2016 16:12:09 GMT-0800 (PST)',
        rating: 3
      });
  });

  it("Defaults array for incorrect action", () =>
    expect(colorReducer()).toEqual({}));
});
```

To test a reducer, we need a state and a sample action. We obtain the result by invoking our SUT, the color function, with these sample objects. Finally, we check the result to make sure the appropriate state was returned using the .toEqual matcher.

To test `ADD_COLOR`, the initial state doesn’t matter much. However, when we send the color reducer an `ADD_COLOR` action, it should return a new color object.

To test `RATE_COLOR`, we’ll provide an initial color object with a rating of 0 for the assumed state. Sending this state object along with a `RATE_COLOR` action should result in a color object that has our new rating.

### deep-freeze

If RATE_COLOR case in the reducer is like this:

```javascript
case 'RATE_COLOR':
  state.rating = action.rating
  return state
```

State is supposed to be immutable, yet here we are clearly mutating the state by changing the value for rating in the state object. Our tests should fail if reducer is like that. **deep-freeze can help us make sure our state and action objects stay immutable by preventing them from changing**:

```
npm install deep-freeze --save-dev
```

When invoking the color reducer, we will deep-freeze both the state and the action object. Both objects should be immutable, and deep-freezing them will cause an error if any code does try to mutate these objects:

## Testing the Store

If the store works, there is a good chance that your app is going to work. The process for testing the store involves creating a store with your reducers, injecting an assumed state, dispatching actions, and verifying the results.

While testing the store you can integrate your action creators, testing the store and the action creators together.

This module exports a function that we can use to create stores. It abstracts away the details of creating a store for the color organizer. This file contains the reducers, middleware, and default state necessary to create a store for our app. When creating a store with the storeFactory, we can optionally pass in an initial state for our new store, which will help us when it is time to test this store.

Jest has setup and teardown features that allow you to execute some code before and after executing each test or suite. `beforeAll` and `afterAll` are invoked before and after each test suite is executed, respectively. `beforeEach` and `afterEach` are invoked before or after each it statement is executed.

Let’s see how we can test the store while testing the addColor action creator in the file `./__tests__/actions/actions.color.test.js`. The following example will test our store by dispatching an addColor action creator and verifying the results:

```javascript
// __test__/actions/actions.color.test.js
import storeFactory from '../../app/store/storeFactory';
import { sortColors, addColor, rateColor, removeColor } from '../../app/actions/actions.color';

describe("Action Creators", () => {

  let store;

  describe("addColor", () => {

    const colors = [
      {
        id: "8658c1d0-9eda-4a90-95e1-8001e8eb6036",
        title: "lawn",
        color: "#44ef37",
        timestamp: "Mon Apr 11 2016 12:54:19 GMT-0700 (PDT)",
        rating: 4
      },
      {
        id: "f9005b4e-975e-433d-a646-79df172e1dbb",
        title: "ocean blue",
        color: "#0061ff",
        timestamp: "Mon Apr 11 2016 12:54:31 GMT-0700 (PDT)",
        rating: 2
      },
      {
        id: "58d9caee-6ea6-4d7b-9984-65b145031979",
        title: "tomato",
        color: "#ff4b47",
        timestamp: "Mon Apr 11 2016 12:54:43 GMT-0700 (PDT)",
        rating: 0
      }
    ];

    beforeAll(() => {
      // global.localStorage = {};    this is moved to global.js
      store = storeFactory({ colors });
      store.dispatch(addColor("Dark Blue", "#000033"));
    });

    afterAll(() => global.localStorage['redux-store'] = false);

    it("should add a new color", () => {
      expect(store.getState().colors.length).toBe(4);
    });

    it("should add a unique guid id", () =>
      expect(store.getState().colors[3].id.length).toBe(36));

    it("should set the rating to 0", () =>
      expect(store.getState().colors[3].rating).toBe(0));

    it("should set timestamp", () =>
      expect(store.getState().colors[3].timestamp).toBeDefined());

  });

  ...
});
```

We set up the test by using the storeFactory to create a new store instance that contains three sample colors in the state. Next, we dispatch our addColor action creator to add a fourth color to the state: Dark Blue.

Each test now verifies the results of the dispatched action. They each contain one expect statement. If any of these tests were to fail, we would know exactly what field of the new action was causing issues.

This time we used two new matchers: `.toBe` and `.toBeDefined`. The .toBe matcher compares the results using the === operator. This matcher can be used to compare primitives like numbers or strings, whereas the `.toEqual` matcher is used to deeply compare objects. The .toBeDefined matcher can be used to check for the existence of a variable or a function. In this test, we check for the existence of the timestamp.

## Testing React Components

We can test these components by rendering them and checking the resulting DOM.

We are not running our tests in a browser; we are running them in the terminal with Node.js. Node.js does not have the DOM API that comes standard with each browser. Jest incorporates an npm package called **`jsdom` that is used to simulate a browser environment in Node.js**, which is essential for testing React components.

### Setting Up the Jest Environment

#### global file

Jest provides us with the ability to run a script before any tests are run where we can **set up additional global variables** that can be used in any of our tests.

For example, let’s say we wanted to add React to the global scope along with some sample colors that can be accessed by any of our tests. We could create a file called `/__tests__/global.js`:

```javascript
import React from 'react';
import deepFreeze from 'deep-freeze';

global.React = React;

window.localStorage = {};
console.groupCollapsed = jest.fn();
console.log = jest.fn();
console.groupEnd = jest.fn();

global._testColors = deepFreeze([
    {
        id: "8658c1d0-9eda-4a90-95e1-8001e8eb6036",
        title: "lawn",
        color: "#44ef37",
        timestamp: "Sun Apr 10 2016 12:54:19 GMT-0700 (PDT)",
        rating: 4
    },
    {
        id: "f9005b4e-975e-433d-a646-79df172e1dbb",
        title: "ocean blue",
        color: "#0061ff",
        timestamp: "Mon Apr 11 2016 12:54:31 GMT-0700 (PDT)",
        rating: 2
    },
    {
        id: "58d9caee-6ea6-4d7b-9984-65b145031979",
        title: "tomato",
        color: "#ff4b47",
        timestamp: "Fri Apr 15 2016 12:54:43 GMT-0700 (PDT)",
        rating: 0
    }
]);
```

This file adds React and some immutable test colors to the global scope. Next, we have to tell Jest to run this file before running our tests. We can do this by adding a setupFiles field to the jest node in package.json:

```json
"jest": {
  "setupFiles": ["./__tests__/global.js"],
  "modulePathIgnorePatterns": ["global.js"]
}
```

The setupFiles field is used to provide an array of files that Jest should run to set up the global environment before our tests. The modulePathIgnorePatterns field tells Jest to ignore the global.js file when running the tests because it does not contain a test suite; it is a setup file. This field is necessary because we’d prefer to add the global.js file to the `__tests__` folder even though it does not contain any tests.

#### IGNORING SCSS IMPORTS

If you import SCSS (or CSS or SASS) files directly into your components, you will need to ignore these imports while testing. Otherwise, they will cause the tests to fail.

These files can be ignored by incorporating a module mapper that returns an empty string when .css, .scss, or .less files are imported. Let’s install `jest-css-modules`:

```
npm install jest-css-modules --save-dev
```

Now that we have this package installed, we need to tell Jest to use this module in place of any .scss import. We need to add a moduleNameMapper field to the jest node in our package.json file:

```json
"jest": {
    "setupFiles": ["./__tests__/global.js"],
    "modulePathIgnorePatterns": ["global.js"],
    "moduleNameMapper": {
      "\\.(scss)$": "<rootDir>/node_modules/jest-css-modules"
    }
  }
```

This tells Jest to use the `jest-css-modules` module in place of any import that ends with .scss. Adding these lines of code to your package.json file will prevent your tests from failing due to .scss imports.

#### Enzyme

We only have two more npm modules to install before we begin writing our first component test:

```
npm install enzyme react-test-renderer --save-dev
```

> note: react-addons-test-utils is for older react 14

`Enzyme` is a testing utility for React components designed at Airbnb. Enzyme requires `react-test-renderer`, a set of tools that can be used to render and interact with components during a test. Additionally, react-dom is required, but we’ll assume that you already have react-dom installed.

Enzyme makes it easier to render a component and traverse the rendered output. Enzyme is not a testing or assertion framework. It handles the task of rendering React components for testing and provides the necessary tools for traversing child elements, verifying props, verifying state, simulating events, and querying the DOM.

Enzyme has three main methods for rendering:

* shallow: renders components one level deep for unit testing.
* mount: renders components using the browser DOM and is necessary when you need to test the full component lifecycle and the properties or state of child elements.
* render: render static HTML markup with a component. 

---

Consider the Star component:

```jsx
const Star = ({ selected = false, onClick = f => f }) =>
    <div className={(selected) ? "star selected" : "star"}
        onClick={onClick}>
    </div>;
```

It should render a div element with a className that depends upon the selected property. It should also respond to click events.

Let’s write a test for the Star component with Enzyme. We will use Enzyme to render the component and find specific DOM elements within the rendered Star. We can use the shallow method to render our component one level deep:

```javascript
// Star.test.js
import { shallow } from 'enzyme';
import Star from '../../../app/components/ui/Star';

describe("<Star /> UI Component", () => {

    it("renders default star", () =>
        expect(shallow(<Star />).find('div.star').length)
            .toBe(1));

    it("renders selected stars", () =>
        expect(shallow(<Star selected={true} />).find('div.selected.star').length)
            .toBe(1));

    it("click does not cause error", () => {
        shallow(<Star selected={true} />).find('div').simulate('click');
    });

    it("invokes onClick", () => {
        const _click = jest.fn();
        shallow(<Star onClick={_click} />)
            .find('div.star')
            .simulate('click');
        expect(_click).toBeCalled();
    });
});
```

Enzyme comes with functions that somewhat resemble jQuery’s. We can use the find method to query the resulting DOM using selector syntax.

In the first test, a sample Star is rendered and we verify that it results in a DOM that contains a div element that has the star class. In the second test, a sample selected Star is rendered and we verify that the resulting DOM contains a div element with both the star class and the selected class. Checking the length assures us that only one div was rendered in each test.

Next, we’ll need to test the click event. Enzyme comes with tools that allow us to simulate events and verify that those events have occurred. For this test, we need a function that we can use to verify that the onClick property is working. We need a mock function, and Jest has us covered.

In this test a mock function, _click, is created using `jest.fn`. When we render the Star, we send our mock function as the onClick property. Next, we locate the rendered div element and simulate a click event on that element using Enzyme’s simulate method. Clicking the Star should invoke the onClick property and, in turn, invoke our mock function. The .toBeCalled matcher can be used to verify that a mock function was invoked.

Enzyme can be used to help us render components, find rendered DOM elements or other components, and interact with them.

#### Mocking Components

The last test introduced the concept of mocking: we used a mock function to test the Star component. Jest is full of tools to help us create and inject all sorts of different mocks that can help us write better tests. Mocks are objects that are used in place of real objects for the purposes of testing.

**The purpose of mocking is to allow you to focus your tests on the one component or object that you are trying to test**, the SUT. Mocks are used in the place of objects, components, or functions that your SUT depends on. This allows you to certify that your SUT is working appropriately without any interference from its dependencies. Mocking allows you to isolate, build, and test functionality independently of other components.

## Testing Hocs

One place where we will need to use mocks is when we are testing higher-order components. HOCs are responsible for adding functionality to injected components via properties. We can create a mock component and send it to an HOC to certify that the HOC adds the appropriate properties to our mock.

Let’s take a look at a test for Expandable. In order to set up a test for the HOC, we must first create a mock component and send it to the HOC. The MockComponent will be used in place of a real component:

```jsx
import { mount } from 'enzyme'
import ExpandableComponent from '../../../app/components/hocs/ExpandableComponent';

describe("Expandable Higher-Order Component", () => {

    let props,
        wrapper,
        ComposedComponent,
        MockComponent = ({collapsed, expandCollapse}) =>
            <div onClick={expandCollapse}>
                {(collapsed) ? 'collapsed' : 'expanded'}
            </div>

    describe("Rendering UI", ... )

    describe("Expand Collapse Functionality", ... )

})
```

The MockComponent is simply a stateless functional component that we developed on the fly. It returns a div with an onClick handler that will be used to test the expandCollapse function. The state, expanded or collapsed, is displayed in the mock component as well. This component will not be used anywhere else but in this test.

The SUT is the Expandable HOC. Before our test, we will invoke the HOC using our mock and check the returned component to verify that the appropriate properties have been applied.

The mount function will be used instead of the shallow function so that we can check the properties and state of the returned component:

```jsx
describe("Rendering UI", () => {

    beforeAll(() => {
        ComposedComponent = ExpandableComponent(MockComponent)
        wrapper = mount(<ComposedComponent foo="foo" gnar="gnar"/>)
        props = wrapper.find(MockComponent).props()
    })

    it("starts off collapsed", () =>
        expect(props.collapsed).toBe(true)
    )

    it("passes the expandCollapse function to composed component", () =>
        expect(typeof props.expandCollapse)
            .toBe("function")
    )

    it("passes additional foo prop to composed component", () =>
        expect(props.foo)
            .toBe("foo")
    )

    it("passes additional gnar prop to composed component", () =>
        expect(props.gnar)
            .toBe("gnar")
    )
})
```

Once we create a composed component using our HOC, we can verify that the composed component has added the appropriate properties to our mock component by mounting it and checking the properties object directly. This test makes sure that the HOC has added the collapsed property and the method for changing that property, expandCollapse. It also verifies that any properties added to the composed component, foo and gnar, make their way to the mock.

Next, let’s verify that we can change the collapsed property of our composed component:

```jsx
describe("Expand Collapse Functionality", () => {
    let instance

    beforeAll(() => {
        ComposedComponent = ExpandableComponent(MockComponent)
        wrapper = mount(<ComposedComponent collapsed={false}/>)
        instance = wrapper.instance()
    })

    it("renders the MockComponent as the root element", () => {
        expect(wrapper.first().is(MockComponent))
    })

    it("starts off expanded", () => {
        expect(instance.state.collapsed).toBe(false)
    })

    it("toggles the collapsed state", () => {
        instance.expandCollapse()
        expect(instance.state.collapsed).toBe(true)
    })
}) 
```

Once we mount a component, we can gather information about the rendered instance with wrapper.instance. In this case, we want the component to start off as collapsed. We can check both the properties and state of the instance to assure ourselves that it has in fact started off collapsed.

The wrapper also has some methods for traversing the DOM. In the first test case, we select the first child element using wrapper.first and verify that the element is an instance of our MockComponent.

HOCs are a great place to get introduced to mocks because the process of injecting the mock is easy: simply send it to the HOC as an argument. The concept of mocking private components is the same, but the injection process is a little bit trickier.

#### Jest Mocks

Jest allows us to inject mocks into any of our components, not just HOCs. With Jest, you can mock any module that your SUT imports. Mocking allows us to focus testing on the SUT and not other modules that could potentially cause issues.

For example, let’s take a look at the ColorList component, which imports the Color component:

```jsx
// ColorList.js
import React from 'react';
import PropTypes from 'prop-types';
import Color from './Color';
import '../../scss/ColorList.scss';

const ColorList = ({ colors = [], onRate = f => f, onRemove = f => f }) =>
    <div className="color-list">
        {(colors.length === 0) ?
            <p>No Colors Listed. (Add a Color)</p> :
            colors.map(color =>
                <Color key={color.id}
                    {...color}
                    onRate={(rating) => onRate(color.id, rating)}
                    onRemove={() => onRemove(color.id)} />
            )
        }
    </div>;

ColorList.propTypes = {
    colors: PropTypes.array,
    onRate: PropTypes.func,
    onRemove: PropTypes.func
};

export default ColorList;
```

We want to make sure the ColorList component functions appropriately. We are not concerned with the Color component; it should have its own unit test. We can write a test for ColorList that replaces the Color component with a mock:

```jsx
import { mount } from 'enzyme'
import ColorList from '../../../app/components/ui/ColorList';

jest.mock('../../../app/components/ui/Color', () =>
  ({rating, onRate=f=>f}) =>
    <div className="mock-color">
      <button className="rate" onClick={() => onRate(rating)} />
    </div>
)

describe("<ColorList /> UI Component", () => {

    describe("Rating a Color", () => {

        let _rate = jest.fn()

        beforeAll(() =>
            mount(<ColorList colors={_testColors} onRate={_rate} />)
                .find('button.rate')
                .first()
                .simulate('click')
        )

        it("invokes onRate Handler", () =>
            expect(_rate).toBeCalled()
        )

        it("rates the correct color", () =>
            expect(_rate).toBeCalledWith(
                "8658c1d0-9eda-4a90-95e1-8001e8eb6036",
                4
            )
        )

    })

})
```

In this test, we used jest.mock to inject a mock in place of the actual Color component. The first argument sent to jest.mock is the module that we wish to mock, and the second argument is a function that returns the mocked component. In this case, the Color mock is a scaled-back version of the Color component. This test is only concerned with rating the color, so the mock only handles the properties related to rating a color.

When this test runs, Jest will replace the Color component with our mock. We are sending the global _testColors that we set up earlier in this chapter when we render the ColorList. When the ColorList renders each color, our mock will be rendered instead. When we simulate a click event on the first button, that event will happen on our first mock.

The rendered DOM for this component would look something like:

```html
<ColorList>
  <div className="color-list">
    <MockColor onRate={[Function]} rating={4}>
      <div className="mock-color">
        <button id="rate" onClick={[Function]} />
      </div>
    </MockColor>
    <MockColor onRate={[Function]} rating={2}>
      <div className="mock-color">
        <button id="rate" onClick={[Function]} />
      </div>
    </MockColor>
    <MockColor onRate={[Function]} rating={0}>
      <div className="mock-color">
        <button id="rate" onClick={[Function]} />
      </div>
    </MockColor>
  </div>
</ColorList>
```

The real Color component would pass the selected rating to the ColorList, but our mock does not use the StarRating component. It doesn’t rate colors; instead, it pretends to rate the color simply by passing the current rating back to the ColorList. We do not care about the Color component in this test; we only care about the ColorList. The ColorList behaves as expected. Clicking on the first color passes the correct rating to the onRate property.

## Manual Mocks

Jest allows us to create modules to use for our mocks. Instead of adding the code for mocks directly to the test, place each mock in its own file in a `__mocks__` folder where Jest will look for them.

Let’s take a look at the /app/components/Containers.js. This file contains three containers. For this next test, we will focus on the Colors container:

```javascript
import ColorList from './ui/ColorList'

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

The Colors container is used to connect data from the store to the ColorList component. It sorts the colors found in state and sends them to the ColorList as a property. It also handles the `onRate` and `onRemove` function properties found in the ColorList. Finally, this container depends on the ColorList module.

You create a manual mock by adding a <Module>.js file to a folder called `__mocks__`. The `__mocks__` folder contains the mocked modules that are used in place of the real modules during testing.

For example, we will add a ColorList mock to our current project by creating a `__mocks__` folder in the `/app/components/ui` folder, at the same level as the ColorList component. We will then place our mock, ColorList.js, in that folder.

Our mock will simply render an empty div element. Take a look at the code for the ColorList.js mock:

```jsx
const ColorListMock = () => <div className="color-list-mock"></div>
ColorListMock.displayName = "ColorListMock"
export default ColorListMock
```

Now, whenever we mock the /app/components/ui/ColorList component with jest.mock, Jest will obtain the appropriate mock from the `__mocks__` folder. We do not have to define the mock directly in our test.

In addition to manually mocking the ColorList, we will also create a mock for the store. Stores have three important functions: dispatch, subscribe, and getState. Our mock store will also have these functions. The getState function provides an implementation for that mock function that returns a sample state using our global test colors.

We will use this mock store to test the container. We will render a Provider component with our mock store as the store property. Our container should obtain the colors from the store, sort them, and send them to our mock:

```javascript
import { mount, shallow } from 'enzyme'
import { Provider } from 'react-redux'
import { Colors } from '../../../app/components/Containers'

jest.mock('../../../app/components/ui/ColorList')

describe("<Colors /> Container ", () => {

    let wrapper
    const _store = {
        dispatch: jest.fn(),
        subscribe: jest.fn(),
        getState: jest.fn(() =>
            ({
                sort: "SORTED_BY_DATE",
                colors: _testColors
            })
        )
    }

    beforeAll(() => wrapper = mount(
      <Provider store={_store}>
          <Colors />
      </Provider>
    ))

    it("renders three colors", () => {
        expect(wrapper
            .find('ColorListMock')
            .props()
            .colors
            .length
        ).toBe(3)
    })

    it("sorts the colors by date", () => {
        expect(wrapper
            .find('ColorListMock')
            .props()
            .colors[0]
            .title
        ).toBe("tomato")
    })

})
```

In this test we invoke jest.mock to mock the ColorList component, but we only send it one argument: the path to the module to mock. Jest knows to look in the `__mocks__` folder to find the implementation for that mock. We are no longer using the real ColorList; we are using our bare-bones mock component. Once rendered, our DOM should look something like this:

```html
<Provider>
  <Connect(ColorListMock)>
    <ColorListMock colors={[...]} 
      onRate={[Function]} 
      onRemove={[Function]}>
        <div className="color-list-mock" />
    </ColorListMock>
  </Connect(ColorListMock)>
</Provider>
```

If our container works, it will have sent three colors to our mock. The container should have sorted those colors by date. We can verify this by checking that “tomato” is the first color, because of the three colors in _testColors, it has the most recent timestamp.

Let’s add a few more tests to make sure that onRate and onRemove are working appropriately:

```javascript
afterEach(() => jest.resetAllMocks())

it("dispatches a REMOVE_COLOR action", () => {
    wrapper.find('ColorListMock')
        .props()
        .onRemove('f9005b4e-975e-433d-a646-79df172e1dbb')

    expect(_store.dispatch.mock.calls[0][0])
        .toEqual({
            id: 'f9005b4e-975e-433d-a646-79df172e1dbb',
            type: 'REMOVE_COLOR'
        })
})

it("dispatches a RATE_COLOR action", () => {
    wrapper.find('ColorListMock')
        .props()
        .onRate('58d9caee-6ea6-4d7b-9984-65b145031979', 5)

    expect(_store.dispatch.mock.calls[0][0])
        .toEqual({
            id: "58d9caee-6ea6-4d7b-9984-65b145031979",
            type: "RATE_COLOR",
            rating: 5
        })
})
```
  
To test onRate and onRemove, we do not have to actually simulate clicks. All we need to do is invoke those function properties with some information and verify that the store’s dispatch method was called with the correct data. Invoking the onRemove property should cause the store to dispatch a `REMOVE_COLOR` action. Invoking the onRate property should cause the store to dispatch a `RATE_COLOR` action. Additionally, we need to make sure the dispatch mock has been reset after each test is complete.

The ability to easily inject mocks into the modules that we want to test is one of Jest’s most powerful features. Mocking is a very effective technique for focusing your tests on the SUT.

## Snapshot Testing

Test-driven development is a great way to approach testing helper functions, custom classes, and datasets. However, when it comes to testing the UI, TDD can be tricky and often impractical. The UI frequently changes, which makes maintaining UI tests a time-consuming practice. It is also pretty common to be tasked with the job of writing tests for UI components that already exist in production.

Snapshot testing provides us with a way to quickly test UI components to make sure that we have not caused any unexpected changes. Jest can save a snapshot of the rendered UI and compare it to the rendered output of future tests. This allows us to verify that our updates have not had any unexpected effects while still allowing us to move quickly and not get too bogged down with the practicalities of testing the UI. Additionally, snapshots can easily be updated when UI changes are expected.

Let’s see how we can test the Color component with snapshot testing. First, let’s take a look at the existing code for the Color component:

```javascript
import React from 'react';
import StarRating from './StarRating';
import '../../scss/Color.scss';
import TimeAgo from './TimeAgo';
import FaTrash from 'react-icons/lib/fa/trash-o';

export default class Color extends React.Component {
    render() {
        const { title, color, rating, timestamp, onRemove, onRate } = this.props;
        return (
            <section className="color" style={this.style}>
                <h1>{title}</h1>
                <button onClick={onRemove}>
                    <FaTrash />
                </button>
                <div className="color"
                    style={{ backgroundColor: color }}>
                </div>
                <TimeAgo timestamp={timestamp} />
                <div>
                    <StarRating starsSelected={rating} onRate={onRate} />
                </div>
            </section>
        );
    }

}

Color.defaultProps = {
    rating: 0,
    onRemove: f => f,
    onRate: f => f
};
```

If we render this component with specific properties, we would expect a DOM that contains specific components based on the properties that we have sent:

```javascript
shallow(
    <Color title="Test Color" 
        color="#F0F0F0" 
        rating={3}
        timestamp="Mon Apr 11 2016 12:54:19 GMT-0700 (PDT)" 
    />
).html()
```

The resulting DOM should look something like:

```html
<section class=\"color\">
  <h1>Test Color</h1>
  <button><svg /></button>
  <div class=\"color\" style=\"background-color:#F0F0F0;\"></div>
  <div class=\"time-ago\">4/11/2016</div>
  <div>
    <div class=\"star-rating\">
      <div class=\"star selected\"></div>
      <div class=\"star selected\"></div>
      <div class=\"star selected\"></div>
      <div class=\"star\"></div>
      <div class=\"star\"></div>
      <p>3 of 5 stars</p>
    </div>
  </div>
</section>
```

Snapshot testing will allow us to save a snapshot of this DOM the very first time we run the test. Then, we’ll be able to compare future tests to that snapshot to make sure the resulting output is always the same.

Let’s go ahead and write a snapshot test for the Color component:

```javascript
import { shallow } from 'enzyme'
import Color from '../../../app/components/ui/Color'

describe("<Color /> UI Component", () => {

    it("Renders correct properties", () =>
        let output = shallow(
            <Color title="Test Color"
                color="#F0F0F0"
                rating={3}
                timestamp="Mon Apr 11 2016 12:54:19 GMT-0700 (PDT)"
            />
        ).html()

        expect(output).toMatchSnapshot()
    )

})
```

In this test, we use Enzyme to render the component and collect the resulting output as a string of HTML. .toMatchSnapshot is the Jest matcher used for snapshot testing. The first time this test is run, Jest will save a copy of the resulting HTML in a snapshot file. This file will be added to a `__snapshots__` folder in the same directory as the test. Currently, the snapshot file would look like:

```jsx
exports[`<Color /> UI Component Renders correct properties 1`] = 
     `"<section class=\"color\"><h1>Test Color</h1><button><svg ...
```

Every other time the test is run, Jest will compare the output to the same snapshot. If anything at all is different about the resulting HTML, the test will fail.

Snapshot testing allows us to move quickly, but if we move too fast, we could end up writing flaky tests, or tests that pass when they should fail. Taking snapshots of HTML strings will work for testing, but it is hard for us to verify that the snapshot is actually correct. Let’s improve our snapshot by saving the output as JSX.

For this, we’ll need to install the `enzyme-to-json `module:

```
npm install enzyme-to-json --save-dev
```

This module provides a function that we can use to render Enzyme wrappers as JSX, which makes it easier to review the snapshot output for correctness.

To render our snapshot using enzyme-to-json, we would first shallow-render the Color component with Enzyme, then send that result to the `toJSON` function and the result of toJSON to the expect function. We may be tempted to write code that looks like:

```javascript
expect(
  toJSON(
    shallow(
      <Color title="Test Color" 
              color="#F0F0F0" 
              rating={3}
              timestamp="Mon Apr 11 2016 12:54:19 GMT-0700 (PDT)" 
          />
    )
  )
).toMatchSnapshot()
```

But this is a perfect place to use a little composition to improve our code. Remember composition? Smaller functions can be put together to make larger functions. We can use the compose function from Redux to make a single larger function out of shallow, toJSON, and expect:

```javascript
import { shallow } from 'enzyme'
import toJSON from 'enzyme-to-json'
import { compose } from 'redux'
import Color from '../../../app/components/ui/Color'

describe("<Color /> UI Component", () => {

    const shallowExpect = compose(expect,toJSON,shallow)

    it("Renders correct properties", () =>
        shallowExpect(
          <Color title="Test Color" 
              color="#F0F0F0" 
              rating={3}
              timestamp="Mon Apr 11 2016 12:54:19 GMT-0700 (PDT)" 
          />
        ).toMatchSnapshot()
    )

})
```

The shallowExpect function takes a component and shallow-renders it, converts the result to JSON, and then sends it to the expect method that returns all of the Jest matchers.

If we run this test, it should fail because the output is now JSX and not an HTML string. Our test no longer matches the snapshot. However, snapshots are easy to update. We can update the snapshot by running the test again with the updateSnapshot flag:

```
jest --updateSnapshot
```

If we run Jest with the watch flag:

```
jest --watch
```

Jest will continue to run in the terminal and listen for changes to our source code and tests. If we make any changes, Jest will rerun our tests. When you are watching tests, you can easily update the snapshot by pressing the u key:

Snapshot Summary
 › 1 snapshot test failed in 1 test suite. Inspect your code changes or press 
 `u` to update them.

Test Suites: 1 failed, 6 passed, 7 total
Tests:       1 failed, 28 passed, 29 total
Snapshots:   1 failed, 1 total
Time:        1.407s
Ran all test suites.

Watch Usage
 › Press u to update failing snapshots.
 › Press p to filter by a filename regex pattern.
 › Press q to quit watch mode.
 › Press Enter to trigger a test run.
Once you update the snapshot, the test will pass. The snapshot file has now changed. Instead of one long HTML string, the snapshot now looks like:

```javascript
exports[`<Color /> UI Component Renders correct properties 1`] = `
<section
  className="color">
  <h1>
    Test Color
  </h1>
  <button
    onClick={[Function]}>
    <FaTrashO />
  </button>
  <div
    className="color"
    style={
      Object {
        "backgroundColor": "#F0F0F0",
      }
    } />
  <TimeAgo
    timestamp="Mon Apr 11 2016 12:54:19 GMT-0700 (PDT)" />
  <div>
    <StarRating
      onRate={[Function]}
      starsSelected={3} />
  </div>
</section>
';
```

This snapshot is much more readable. We can take a quick look at it to verify the results are correct before moving on to our next test. Snapshot testing can be a very effective way to quickly add testing to your applications.

## Using Code Coverage

Code coverage is the process of reporting on how many lines of code have actually been tested. It provides a metric that can help you decide when you have written enough tests.

Jest ships with Istanbul, a JavaScript tool used to review your tests and to generate a report that describes how many statements, branches, functions, and lines have been covered.

To run Jest with code coverage, simply add the coverage flag when you run the jest command:

```
jest --coverage
```

Jest also generates a report that you can run in your browser, which provides more details about what code has been covered by tests. After running Jest with coverage reporting, you will notice that a coverage folder has been added to the root. In a web browser, open this file: `/coverage/lcov-report/index.html`. 

This report tells you how much of the code has been covered, as well as the individual coverage based upon each subfolder. You can drill down into a subfolder to see how well the individual files within have been covered. 

You can also include coverage options in your package.json file:

```json
"jest": {
    "setupFiles": ["./__tests__/global.js"],
    "modulePathIgnorePatterns": ["global.js"],
    "moduleNameMapper": {
      "\\.(scss)$": "<rootDir>/node_modules/jest-css-modules"
    },
    "verbose": true,
    "collectCoverage": true,
    "notify": true,
    "collectCoverageFrom": ["app/**"],
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
```

The coverageThreshold field defines how much code should be covered before your testing passes. We have specified that `80%` of all branches, functions, lines, and statements must be covered.

The collectCoverageFrom field is where you can specify which files should be covered. It takes an array of glob patterns. We have specified that all of the files in the src directory and any subdirectory should be covered.

Setting the collectCoverage option to true means that coverage data will be collected every time we run the jest command on this project. The notify field displays a notification box using your operating system. Finally, the verbose option displays a detailed report of each test every time you run Jest. The verbose report for the “<ColorList /> UI Component” suite looks like:

Code coverage is a great tool to measure the reach of your tests. It is not typical to have 100% code coverage in every project. Shooting for anything **above 85% is a good target**.