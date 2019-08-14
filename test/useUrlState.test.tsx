import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import { act } from 'react-dom/test-utils';

import UrlStateProvider from '../src/UrlStateProvider';
import useUrlState, { mergeParams, replaceParams } from '../src/useUrlState';

configure({ adapter: new Adapter });

const DEBOUNCE = 50;

const simulateChange = (input: any, { value }: any) => {
    input.prop('onChange')({ target: { name: 'test', value } });
};

const App = () => {
    return <UrlStateProvider>
        <Input />
    </UrlStateProvider>;
};

const Input = () => {
    const [urlState, setUrlState] = useUrlState({
        foo: ''
    });

    return <input type="text" name="test" value={urlState.foo} onChange={event => setUrlState({ foo: event.target.value }, { debounce: DEBOUNCE })} />;
};

describe('useUrlState', () => {
    it('should sync the url', (done) => {
        window.history.pushState({}, '', '?foo=test');

        const wrapper = mount(<App />);

        expect(wrapper.find('input').props().value).toBe('test');

        act(() => simulateChange(wrapper.find('input'), { value: 'bar' }));

        wrapper.update();

        expect(wrapper.find('input').props().value).toBe('bar');

        expect(window.location.search).toBe('?foo=test');

        setTimeout(() => {
            expect(window.location.search).toBe('?foo=bar');

            // TODO: make callback async to avoid warning (available in React 16.9)
            act(() => window.history.back());

            setTimeout(() => {
                wrapper.mount();

                setTimeout(() => {
                    expect(wrapper.find('input').props().value).toBe('test');

                    wrapper.unmount();

                    done();
                }, 25);

            }, 25);
        }, DEBOUNCE + 25);
    });
});

describe('mergeParams', () => {
    beforeEach(() => {
        window.history.pushState({}, '', '?foo=bar');
    });

    it('should add a new param', () => {
        expect(mergeParams({ bar: 'foo' })).toBe('?foo=bar&bar=foo');
    });

    it('should replace a param', () => {
        expect(mergeParams({ foo: 'foo' })).toBe('?foo=foo');
    });
});

describe('replaceParams', () => {
    beforeEach(() => {
        window.history.pushState({}, '', '?foo=bar');
    });

    it('should add a new param', () => {
        expect(replaceParams({ bar: 'foo' })).toBe('?bar=foo');
    });

    it('should replace a param', () => {
        expect(replaceParams({ foo: 'foo' })).toBe('?foo=foo');
    });
});
