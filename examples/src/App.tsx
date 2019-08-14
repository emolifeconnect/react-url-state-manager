import React, { useRef } from 'react';

import { useUrlState } from '../../src/';

const App = () => {
    const defaultUrlState = {
        search: ''
    };

    const [urlState, setUrlState] = useUrlState(defaultUrlState);

    const count = useRef(0);
    count.current++;

    return <div>
        <input type="text" value={urlState.search} onChange={event => setUrlState({ search: event.target.value }, { debounce: 500 })} />
        {' '}
        <button onClick={() => setUrlState({ random: Math.round(Math.random() * 1000) })}>Set random number</button>
        {' '}
        <button onClick={() => setUrlState(() => defaultUrlState)}>Reset</button>
        <br /><br />
        Renders: {count.current}
    </div>;
};

export default App;
