import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class App extends Component {
    static propTypes = {
        data: PropTypes.object
    }

    render() {
        const {
            data: {
                authors: {loading: loadingAuthors, entities: authors},
                books: {loading: loadingBooks, entities: books},
                stores: {loading: loadingStores, entity: store, relationships: {
                    books: {loading: loadingStoreBooks, entities: storeBooks}
                }}
            }
        } = this.props;

        return (
            <div>
                <section>
                    <h1>Authors</h1>
                    <ul>
                        {loadingAuthors && <li><i>Loading...</i></li>}
                        {authors.map((author, index) => <li key={index}>
                            {author.getIn(['attributes', 'name'])}
                            <ul>
                                {author.getIn(['relationships', 'books', 'data'])
                                    .map((book) => books.get(book.get('id')))
                                    .filter((book) => !!book)
                                    .map((book, index) => <li key={index}>{book.getIn(['attributes', 'title'])}</li>)}
                            </ul>
                        </li>)}
                    </ul>
                </section>
                <section>
                    <h1>Books</h1>
                    <ul>
                        {loadingBooks && <li><i>Loading...</i></li>}
                        {books.map((book, index) => <li key={index}>{book.getIn(['attributes', 'title'])}</li>)}
                    </ul>
                </section>
                {loadingStores && <section>
                    <h1>Loading store...</h1>
                </section>}
                {!loadingStores && <section>
                    <h1>Store: {store.getIn(['attributes', 'name'])}</h1>
                    <ul>
                        {loadingStoreBooks && <li><i>Loading...</i></li>}
                        {storeBooks.map((book, index) => <li key={index}>{book.getIn(['attributes', 'title'])}</li>)}
                    </ul>
                </section>}
            </div>
        );
        // return <div></div>;
    }
};
