import { BehaviorSubject } from 'rxjs';
import VueRxStore from './vue-rx-store';
import {
  isFn,
  isObject,
  checkKeyValid,
} from './utils';

function initVueRxStore(options) {
  const self = this;
  self._options = options;
  self.subject = new VueRxStore();
  self.init();
  return self.subject;
}

initVueRxStore.prototype = {
  init() {
    const self = this;
    self.inheritRxSubject();
    self.insertActions();
    self.insertStores();
  },
  inheritRxSubject() {
    const self = this;
    let initState = self._options.state || {};
    self._options.state = initState;
    const __proto__ = new BehaviorSubject(self._options.state);
    Object.setPrototypeOf(
      self.subject,
      __proto__,
    );
    self.subject.bindStores = self.bindStores(self.subject);
    self.subject.bindActions = self.bindActions(self.subject);
  },
  insertActions() {
    const self = this;
    const { actions } = self._options;
    if (actions) {
      self.bindActions(self.subject)(actions);
    }
  },
  insertStores() {
    const self = this;
    const { modules } = self._options;
    if (modules && isObject(modules)) {
      self.bindStores(self.subject)(modules);
    }
  },
  bindActions(target) {
    return (actions) => {
      Object.keys(actions).forEach((key) => {
        if (!isFn(actions[key])) return;
        if (checkKeyValid(key)) {
          target[key] = async (...args) => {
            const { value } = target;
            await actions[key].call(
              target,
              value,
              ...args,
            );
          };
        }
      });
    };
  },
  bindStores(target) {
    return (stores) => {
      Object.keys(stores).forEach((key) => {
        if (checkKeyValid(key)) {
          Object.defineProperty(target, key, {
            get() {
              return stores[key].getValue();
            },
            set(newValue) {
              return stores[key].next(newValue);
            },
          });
        }
      });
    };
  },
};

export default initVueRxStore;
