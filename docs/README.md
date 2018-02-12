# Documentation

*Work in progress*

## Basic usage
```javascript
import {createStore, combineReducers, applyMiddleware} from 'redux';
import {createApiMiddleware} from 'rdx-api';
import {createJsonApi} from 'rdx-json-api';

// Create a JSON API
const api = createJsonApi({
    // Default rdx-json options
    name: 'EXAMPLE_API',
    url: 'https://example.danielhuisman.io/v1',
    options: {
        camelize: {
            response: true
        },
        decamelize: {
            query: true,
            body: true
        }
    },
    defaults: {},

    // Define entities
    entities: {
        authors: {
            // Type of the JSON API entity
            type: 'authors',

            // Base URL of this entity
            url: '/authors'
        },
        books: {
            type: 'books',
            url: '/books'
        },
        stores: {
            type: 'stores',
            url: '/stores'
        }
    },

    // Location of the JSON API reducer in the Redux state
    reducerKey: 'entities'
});

// Create JSON API reducer
const reducer = createJsonApiReducer(api, {
    // Remove all relationships starting with an underscore
    removeHiddenrelationships: true,

    // Skip JSON API reducer and set the new state to the returned object if not null
    onAction: (state, action) => null,

    // Called on payload error from rdx-json
    onPayloadError: (state, action) => console.error(action.payloadError)
});

// Initialize Redux store with API middleware and JSON API reducer
const middleware = createApiMiddleware(api);
const store = createStore(combineReducers({
    entities: reducer
}), applyMiddleware(middleware));
```
