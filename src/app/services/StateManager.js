import config from '@app/config';
import { toCurrency } from '@app/helpers';

export default function StateManager(initialState = {}) {
  if (typeof initialState !== 'object' || Array.isArray(initialState)) {
    throw new Error('only object as initial state');
  }

  // Private variables
  const observers = [];
  let state = Object.assign({}, initialState);

  // Private methods
  const subscribe = (observer) => {
    const index = observers.push(observer) - 1;

    return {
      remove: () => {
        delete observers[index];
      },
    };
  };

  const notify = () => {
    observers.forEach(observer => observer(state));
  };

  const getState = () => state;

  const setState = (newState) => {
    if (typeof newState !== 'object' || Array.isArray(newState)) {
      throw new Error('only object as new value');
    }

    state = Object.assign(state, newState);
  };

  // Reveal methods
  return Object.freeze({
    subscribe,
    getState,
    setState: new Proxy(setState, {
      apply(target, thisArgs, argumentsList) {
        if (JSON.stringify(state) !== JSON.stringify(argumentsList[0])) {
          Reflect.apply(target, thisArgs, argumentsList);
          notify();
        }
      },
    }),
  });
}

export const createStateByDays = values => config.days.map((day, index) => {
  const labels = config.labels;
  const value = values[index];

  return {
    label: index === 0 ? labels.tomorrow : `${labels.in} ${day} ${labels.days}`,
    value: value ? toCurrency(value) : toCurrency(0),
  };
});
