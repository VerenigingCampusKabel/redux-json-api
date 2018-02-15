import {combineReducers} from 'redux';
import {createJsonApiReducer} from 'rdx-json-api';

import api from './api';

export default combineReducers({
    entities: createJsonApiReducer(api, {
        removeHiddenRelationships: true,
        onAction: (state, action) => null,
        onPayloadError: (state, action) => console.error(action.payloadError)
    })
});
