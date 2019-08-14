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

    const getUrlState = () => {
        return {
            ...defaultState,
            ...getUrlParams()
        };
    };

    const { stateRef, debounceRef, rerender, renderCount } = useContext(UrlStateContext);

    const localRenderCountRef = useRef(0);

    if (localRenderCountRef.current == 0) {
        stateRef.current = encode(getUrlState());
        debounceRef.current = defaultOptions.debounce;
    }

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

        const oldState = stateRef.current;
        const decodedState = decode(oldState);

        if (isFunction(newValue)) {
            stateRef.current = encode((newValue as UpdateUrlState)(decodedState));
        } else {
            stateRef.current = encode({
                ...decodedState,
                ...newValue
            });
        }

        if (stateRef.current != oldState) {
            rerender();
        }
    };

    /**
     * Watches the internal state and syncs changes to the URL.
     */
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const currentEncodedState = stateRef.current;
            const oldEncodedState = encode(getUrlState());

            if (currentEncodedState != oldEncodedState) {
                pushState(currentEncodedState != encode(defaultState) ? currentEncodedState : null);
            }
        }, debounceRef.current);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [stateRef.current]);

    const pushState = (search: string) => {
        window.history.pushState({}, '', window.location.pathname + (search ? '?' + search : ''));
    };

    /**
     * Watches for external rerenders and syncs the URL params back to the internal state. An
     * external rerender can be caused by anything and potenatially means that the params in the
     * URL have been changed by something other than this hook. Internal rerenders are only caused
     * by this hook's `setUrlState` function.
     */
    useEffect(() => {
        localRenderCountRef.current++;

        if (renderCount < localRenderCountRef.current) {
            localRenderCountRef.current = renderCount;

            syncUrlStateToInternalState();
        }
    });

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
     * Syncs the state in the URL to the internal state.
     */
    const syncUrlStateToInternalState = () => {
        setUrlState(() => getUrlState());
    };

    return [
        decode(stateRef.current),
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

export default useUrlState;
