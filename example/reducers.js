import {combineReducers} from 'redux';
import {createJsonApiReducer} from '../lib';

import api from './api';

export default combineReducers({
    entities: createJsonApiReducer(api, {
        onPayloadError: (state, action) => console.error(action.payloadError)
    })
});
