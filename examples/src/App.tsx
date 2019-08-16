import React, { useRef, useState } from 'react';

import { useUrlState } from '../../src/';

const App = () => {
    const defaultUrlState = {
        search: ''
    };

    const [urlState, setUrlState] = useUrlState(defaultUrlState);

    const count = useRef(0);
    count.current++;

    const [, setFoo] = useState(0);

    const rerender = () => {
        window.history.pushState({}, '', '?');
        setFoo(foo => foo + 1);
    };

    return <div>
        <input type="text" value={urlState.search} onChange={event => setUrlState({ search: event.target.value }, { debounce: 500 })} />
        {' '}
        <button onClick={() => setUrlState({ random: Math.round(Math.random() * 1000) })}>Set random number</button>
        {' '}
        <button onClick={() => setUrlState(() => defaultUrlState)}>Reset state</button>
        {' '}
        <button onClick={() => rerender()}>Reset URL</button>
        <br /><br />
        Renders: {count.current}
        <br /><br />
        {JSON.stringify(urlState)}
    </div>;
};

export default App;
