# Documentation

*Work in progress*

## Redux reducer
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

## Redux container
```javascript
import {createJsonApiContainer} from 'rdx-json-api';

import api from './api';
import App from './App';

export default createJsonApiContainer(App, {
    // JSON API object
    api,

    // Default amount of simultaneous page request
    defaultMaxRequests: 3,

    // Default page size
    defaultPageSize: 100,

    // List of entities to load
    entities: [{
        // Multiple entities of type "authors"
        type: 'many',
        name: 'authors',

        // Automatically load these entities
        preload: true,

        // Override default page size
        pageSize: 1,

        // Query to apply (should never include page details)
        query: {
            include: 'books'
        }
    }, {
        // Multiple entities of type "books"
        type: 'many',
        name: 'books',

        // Return all entities in the store (in this case all books included by the authors request above)
        all: true
    }, {
        // One entity of type "stores"
        type: 'single',
        name: 'stores',

        // Automatically load the entity
        preload: true,

        // ID of the entity to load
        id: () => '2',

        // Relationships to include
        relationships: {
            books: {
                // Type, either "single" or "many" just like entities
                type: 'many',

                // Automatically load this relationship
                preload: true,

                // Override default page size
                pageSize: 5
            }
        }
    }]
});
```

## React component
```javascript
import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class App extends Component {
    static propTypes = {
        data: PropTypes.object
    }

    render() {
        // Data is automatically filled by the Redux container
        // Loading flags are booleans, entity/entities are either null or an Immutable List/Map
        const {
            data: {
                authors: {loading: loadingAuthors, entities: authors},
                books: {loading: loadingBooks, entities: books},
                stores: {loading: loadingStores, entity: store, relationships: {
                    books: {loading: loadingStoreBooks, entities: storeBooks}
                }}
            }
        } = this.props;

        // Render the data (see example/src/App.js for a full version)
        return <div>
            <ul>
                {loadingStoreBooks && <li><i>Loading...</i></li>}
                {storeBooks && storeBooks.map((book, index) => <li key={index}>{book.getIn(['attributes', 'title'])}</li>)}
            </ul>
        </div>;
    }
};
```
