import {createJsonApi} from '../lib';

export default createJsonApi({
    name: 'EXAMPLE_API',
    url: 'https://jsonplaceholder.typicode.com',
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
