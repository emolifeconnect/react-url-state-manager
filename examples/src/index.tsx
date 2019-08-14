import React from 'react';
import ReactDOM from 'react-dom';

import { UrlStateProvider } from '../../src/';
import App from './App';

ReactDOM.render(<UrlStateProvider>
    <App />
</UrlStateProvider>, document.getElementById('root'));
