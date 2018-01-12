import {createApiActions} from 'rdx-api';

import api from './api';

// Create API models with their actions
const actions = createApiActions(api);

const {
    entities: {
        authors,
        books
    },
    endpoints,
    resetEndpoint
} = actions;

// Export entity actions and endpoint actions
export {
    endpoints as api,
    resetEndpoint as apiResetEndpoint,
    authors,
    books
};
