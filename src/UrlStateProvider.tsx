import React, { createContext, useRef, useState } from 'react';

import { UrlState } from './useUrlState';

export const UrlStateContext = createContext({
    defaultStateRef: { current: null },
    stateRef: { current: null },
    debounceRef: { current: null },
    rerender: null,
    renderCount: 0
} as UrlState);

export interface UrlStateProviderProps {
    children: React.ReactNode;
}

const UrlStateProvider = ({ children }: UrlStateProviderProps) => {
    const defaultStateRef = useRef({} as UrlState);
    const stateRef = useRef({} as UrlState);
    const debounceRef = useRef();
    const [, setRenderCount] = useState(1);
    const rerender = () => setRenderCount(count => count + 1);

    return <UrlStateContext.Provider value={{ defaultStateRef, stateRef, debounceRef, rerender }}>
        {children}
    </UrlStateContext.Provider>;
};

export default UrlStateProvider;
