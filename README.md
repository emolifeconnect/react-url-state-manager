# React URL state manager

React hook for managing state in the URL. Allows you to use the URL as a state for search inputs, page numbers, filters and more. Includes support for debouncing/throttling.

![Example](https://www.onecommunity.nl/uploads/url-state.gif)

```
npm i react-url-state-manager
```

## Basic example

In the following example the URL is updated after the user stops typing for more than 250 ms.

```jsx
import { useUrlState, UrlStateProvider } from 'react-url-state-manager';

const App = () => {
    return <UrlStateProvider>
        <Search />
    </UrlStateProvider>;
};

const Search = () => {
    const defaultUrlState = {
        search: ''
    };

    const [urlState, setUrlState] = useUrlState(defaultUrlState);

    return <form>
        <input type="text" value={urlState.search} onChange={event => setUrlState({ search: event.target.value }, { debounce: 250 })} />
    </form>;
};
```

## Helper methods

`mergeParams(object)` creates a query string (for example: '?foo=bar') that merges the `object` with the current query parameters.

`replaceParams(object)` creates a query string (for example: '?foo=bar') that replaces the current query parameters with the `object`.
