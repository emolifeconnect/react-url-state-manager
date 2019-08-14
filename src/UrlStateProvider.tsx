import React, { createContext, useRef, useState } from 'react';

import { UrlState } from './useUrlState';

export const UrlStateContext = createContext({
    stateRef: { current: null },
    debounceRef: { current: null },
    rerender: null,
    renderCount: 0
} as UrlState);

export interface UrlStateProviderProps {
    children: React.ReactNode;
}

const UrlStateProvider = ({ children }: UrlStateProviderProps) => {
    const stateRef = useRef();
    const debounceRef = useRef();
    const [renderCount, setRenderCount] = useState(1);
    const rerender = () => setRenderCount(count => count + 1);

    return <UrlStateContext.Provider value={{ stateRef, debounceRef, rerender, renderCount }}>
        {children}
    </UrlStateContext.Provider>;
};

export default UrlStateProvider;
