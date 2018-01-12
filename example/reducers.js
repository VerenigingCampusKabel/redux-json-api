import {createJsonApiReducer} from '../lib';

import api from './api';

export default createJsonApiReducer(api, {
    onPayloadError: (state, action) => console.error(action.payloadError)
});
