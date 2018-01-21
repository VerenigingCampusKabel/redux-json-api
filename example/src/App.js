import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class App extends Component {
    static propTypes = {
        data: PropTypes.object
    }

    render() {
        // const {
        //     data: {
        //         authors: {entities: authors},
        //         books: {entities: books}
        //     }
        // } = this.props;
        //
        // return (
        //     <div>
        //         <section>
        //             <h1>Users</h1>
        //             <ul>
        //                 {authors.map((author, index) => <li key={index}>{author.getIn(['attributes', 'name'])}</li>)}
        //             </ul>
        //         </section>
        //         <section>
        //             <h1>Books</h1>
        //             <ul>
        //                 {books.map((book, index) => <li key={index}>{book.getIn(['attributes', 'title'])}</li>)}
        //             </ul>
        //         </section>
        //     </div>
        // );
        return <div></div>;
    }
};
