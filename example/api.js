import {createJsonApi} from '../lib';

export default createJsonApi({
    name: 'EXAMPLE_API',
    url: 'https://example.danielhuisman.io/v1',
    options: {},
    defaults: {
        credentials: 'include'
    },
    entities: {
        users: {
            type: 'user',
            url: '/users'
        },
        posts: {
            type: 'post',
            url: '/posts'
        }
    }
});
