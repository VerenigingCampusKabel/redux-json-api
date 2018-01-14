import {combineReducers} from 'redux';
import {createJsonApiReducer} from '../../lib';

import api from './api';

export default combineReducers({
    entities: createJsonApiReducer(api, {
        removeHiddenrelationships: true,
        onAction: (state, action) => null,
        onPayloadError: (state, action) => console.error(action.payloadError)
    })
});
