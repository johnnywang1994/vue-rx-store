# vue-rx-store

A state management library for vue-rx, based on Rxjs BehaviorSubject.

This library relys on `vue-rx` & `rxjs`, remember to install them before using this library.


## Dependencies

1. vue-rx 6^
2. rxjs 6^


## Install

Install with npm or yarn.

```
$ npm install vue-rx-store
// or
$ yarn add vue-rx-store
```

Use `vue-rx` in your app entrypoint, such as `main.js`

```js
import Vue from 'vue'
import VueRx from 'vue-rx'

Vue.use(VueRx)
```


## Usage

Create our first vue-rx-store by `create` method.

```js
// store.js
import VueRxStore from 'vue-rx-store';

export const Profile = VueRxStore.create({
  // state key can be ignored, default is an empty object {}.
  state: {
    nickname: 'johnnywang',
  },
});
```

Then just import in your vue component, and put into `subscriptions`, it will automatically being subscribe by vue component, and get the return value as into `data`

```js
// HelloWorld.vue
import { Profile } from './store.js';

export default {
  name: 'HelloWorld',
  subscriptions() {
    return {
      profile$: Profile,
    };
  },
};
```

You can then put it into `<template>` to display the data.

```html
<template>
  <div>{{ profile$.nickname }}</div>
</template>
```


## Actions

If you want to handling with the state inside store, we should define the `actions` property in options:

```js
export const Profile = VueRxStore.create({
  state: {
    nickname: 'johnnywang',
  },
  // define actions to handling state
  actions: {
    changeNickname(state, newName) {
      state.nickname = newName;
    },
  },
});
```

we can then use it inside component or another action

```js
// In component
import { Profile } from './store.js';

export default {
  subscriptions() {
    return {
      profile$: Profile,
    };
  },
  methods: {
    changeName(newName) {
      Profile.changeNickname(newName);
    },
  },
};
```

```js
// In another action
export const Profile = VueRxStore.create({
  state: {
    nickname: 'johnnywang',
  },
  // define actions to handling state
  actions: {
    setAge() {
      // ... do some things
      this.changeNickname('Johnson');
    },
    changeNickname(state, newName) {
      state.nickname = newName;
    },
  },
});
```

### Important

> Be aware that, we can only change state directly when that property is already in the initial state.(`state.nickname = XXX`). If we add any new property data into state which hasnt been declared, we should recall the `next` method by subject itself, which would tell Vue component to retrigger the subject again to use the lastest data for rendering. A use case is when you set state with a return by API.

> If we add new property into state without using `next`, the data will still be stored, but it will be rendered in next time the vue rendering.(change route...etc)

> Also, when using `next`, do not directly use the object get from `getValue` as `next(state)`, it will cause problem, always provide a new object into it, which looks like `next({ ...newState })` for same object assignment situation.

```js
import { getProfile } from './api';

export const Profile = VueRxStore.create({
  // empty
  state: {},
  actions: {
    async get() {
      const res = await getProfile();
      // we can access the store instance by `this`, and call the method by it
      // since `VueRxStore` instance is inherited from `BehaviorSubject`
      this.next(res);

      // we can still then do anything right after `next`
      this.changeNickname('Kevin');
    },
    changeNickname(state, newName) {
      // directly change since nickname has already been declared.
      state.nickname = newName;
    },
  },
});
```

### Async or Sync?

actions can be sync or async, totally up to the user's define.


### Outer defined actions

we can dynamically define new action whenever we want by `bindActions` method.

the method is also used by default when we first creating the instance for `actions` option.

```js
export const Profile = VueRxStore.create({
  state: {},
  // here also called bindActions automatically
  actions: {
    async get() {
      const res = await getProfile();
      this.next(res);
    },
  },
});

// Something to do...

// Bind new actions to the Store
Profile.bindActions({
  changeNickname(state, newName) {
    state.nickname = newName;
  },
});
```


## Modules

It could be very XXX if there's no module system in a state management library.

So we provide a tiny system for user to access between each stores, but without forcing you to use it, you can still just use as pure Rxjs way.

You can use `modules` option which just like `Vuex` to define the modules to be used.

The different thing is that, each `store` can have different dependency store instance.

```js
import VueRxStore from 'vue-rx-store';
import { getProfile, getConfig } from './api';

// Profile store
export const Profile = VueRxStore.create({
  actions: {
    async get() {
      const res = await getProfile();
      this.next(res);
    },
  },
});

// Config store
export const Config = VueRxStore.create({
  modules: { Profile },
  actions: {
    async get() {
      const res = await getConfig();
      this.next(res);
    },
    changeProfileNickname(state, newName) {
      // already in profile state
      this.Profile.nickname = newName;
    },
    addAgeToProfile() {
      // not yet in profile state

      // this.Profile use `getValue` of rx subject
      // deep: Profile.getValue().age;
      this.Profile.age = 33;

      // set to Profile will call the `next` method of subject
      // deep: Profile.next({ ...profileState });
      this.Profile = { ...profileState };
    },
  },
});
```

### Outer bind modules

If now `Profile` store needs to use `Config`, we need to use `bindStores` method, since we can not access to `Config` when `Profile` was inited.

```js
export const Profile = VueRxStore.create({
  // ...
});

export const Config = VueRxStore.create({
  // ...
});

// we need to bind after Config had be declared
Profile.bindStores({ Config });
```


## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2020-present, Johnny Wang
