import { useContext, useEffect, useRef } from 'react';

import { UrlStateContext } from './UrlStateProvider';

const qs = require('qs');

export interface UrlState {
    [key: string]: any;
    [key: number]: any;
}

type UpdateUrlState = (value: UrlState) => UrlState;

type SetUrlState = (newValue: UrlState | UpdateUrlState, options?: UseUrlStateOptions) => void;

export interface UseUrlStateOptions {
    debounce?: number;
}

const useUrlState = (defaultState: UrlState = null, defaultOptions: UseUrlStateOptions = {}) => {
    defaultOptions = {
        debounce: 0,
        ...defaultOptions
    };

    const { defaultStateRef, stateRef, debounceRef, rerender } = useContext(UrlStateContext);

    const updatingRef = useRef(false);

    const getUrlState = () => {
        return {
            ...defaultStateRef.current,
            ...getUrlParams()
        };
    };

    onInit(() => {
        merge(defaultStateRef.current, defaultState);
        merge(stateRef.current, getUrlState());

        debounceRef.current = defaultOptions.debounce;
    });

    /**
     * Updates the state in the URL by merging it with a new `UrlState` or by applying an
     * `UpdateUrlState` callback. State changes are pushed to the URL after after `debounce`
     * milliseconds.
     */
    const setUrlState = (newValue: UrlState | UpdateUrlState, options: UseUrlStateOptions = {}) => {
        options = {
            ...defaultOptions,
            ...options
        };

        debounceRef.current = options.debounce;

        const encodedOldState = encode(stateRef.current);

        if (isFunction(newValue)) {
            stateRef.current = (newValue as UpdateUrlState)({ ...stateRef.current });
        } else {
            merge(stateRef.current, newValue);
        }

        if (encode(stateRef.current) != encodedOldState) {
            rerender();
        }
    };

    /**
     * Watches the internal state and syncs changes to the URL.
     */
    useEffect(() => {
        updatingRef.current = true;

        const timeoutId = setTimeout(() => {
            const currentEncodedState = encode(stateRef.current);
            const oldEncodedState = encode(getUrlState());

            if (currentEncodedState != oldEncodedState) {
                pushState(currentEncodedState != encode(defaultState) ? currentEncodedState : null);
            }

            updatingRef.current = false;
        }, debounceRef.current);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [encode(stateRef.current)]);

    const pushState = (search: string) => {
        window.history.pushState({}, '', window.location.pathname + (search ? '?' + search : ''));
    };

    /**
     * Updates the internal state when the user presses the back button. Necessary for apps that
     * don't use routing packages such as react-router.
     */
    useEffect(() => {
        window.addEventListener('popstate', syncUrlStateToInternalState);

        return () => {
            window.removeEventListener('popstate', syncUrlStateToInternalState);
        };
    }, []);

    /**
     * Update the internal state every rerender (if not currently updating the URL).
     */
    useEffect(() => {
        if (!updatingRef.current) {
            syncUrlStateToInternalState();
        }
    }, [location.search.substr(1)]);

    /**
     * Syncs the state in the URL to the internal state.
     */
    const syncUrlStateToInternalState = () => {
        const encodedState = encode(stateRef.current);
        const urlState = getUrlState();
        const encodedUrlState = encode(urlState);

        if (encodedState != encodedUrlState) {
            stateRef.current = urlState;
            rerender();
        }
    };

    return [
        stateRef.current,
        setUrlState
    ] as [UrlState, SetUrlState];
};

export const getUrlParams = (): UrlState => {
    return decode(location.search.substr(1));
};

export const decode = (state: string) => {
    return qs.parse(state);
};

export const encode = (params: UrlState) => {
    return qs.stringify(params, { encodeValuesOnly: true, skipNulls: true });
};

const merge = (base: any, other: any): any => {
    for (let key in other) {
        base[key] = other[key];
    }

    return base;
};

export const mergeParams = (params: UrlState)  => {
    return replaceParams({
        ...getUrlParams(),
        ...params
    });
};

export const replaceParams = (params: UrlState)  => {
    return `?${encode(params)}`;
};

const isFunction = (obj: any): boolean => {
    return !!(obj && obj.constructor && obj.call && obj.apply);
};

const onInit = (callback: () => void) => {
    const renderCountRef = useRef(0);

    if (renderCountRef.current === 0) {
        callback();
    }

    renderCountRef.current++;
};

export default useUrlState;
