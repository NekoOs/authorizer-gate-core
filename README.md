# Install

```shell
npm install --save authorizer-gate-core
```


## Writing Gates

Gates are simply closures that determine if a user is authorized to perform a given action. 
Gates always receive a user instance as their first argument and may optionally receive additional relevant arguments.

In this example, we'll define a gate to determine if a user can update a given post. The gate will accomplish this 
by comparing the user's id against the user_id of the user that created the post. 

```js
import Gate from "authorizer-gate-core";

Gate.define('update-post', function (user, post) {
    return user.id === post.user_id;
});
```

## Authorizing Actions

To start using gates, you should associate a user.

```js
import Gate from "authorizer-gate-core";

Gate.setUser(user);
```

To authorize an action using gates, you should use the `allows` or `denies` methods provided by the Gate instance. 
Note that you are not required to pass the currently authenticated user to these methods. 

```js
import Gate from "authorizer-gate-core";

if (Gate.allows('update-post', post)) {
    // The user can update the post...
}

if (Gate.denies('update-post', post)) {
    // The user can't update the post...
}
```

If you would like to determine if a user other than the currently initialized user is authorized to perform an
action, you may use the `forUser` method on the Gate instance:

```js
import Gate from "authorizer-gate-core";

if (Gate.forUser(user).allows('update-post', post)) {
    // The user can update the post...
}

if (Gate.forUser(user).denies('update-post', post)) {
    // The user can't update the post...
}
```

You may authorize multiple actions at a time using the `check`, `any` or `none` methods:

```js
import Gate from "authorizer-gate-core";

if (Gate.check(['update-post', 'delete-post'], post)) {
    // The user can update and delete the post...
}

if (Gate.any(['update-post', 'delete-post'], post)) {
    // The user can update or delete the post...
}

if (Gate.none(['update-post', 'delete-post'], post)) {
    // The user can't update or delete the post...
}
```

## Intercepting Gate Checks

Sometimes, you may wish to grant abilities using a custom strategy. You may use the `before` method to define a closure 
that is run before all other authorization checks:

```js
import Gate from "authorizer-gate-core";

Gate.before((user, ability) => {
    return user.abilities.includes(ability);
});
```

If the `before` closure returns a non-nullish result that result will be considered the result of the authorization 
check.

You may use the `after` method to define a closure to be executed after all other authorization checks:

```js
import Gate from "authorizer-gate-core";

Gate.after((user, ability) => {
    return user.abilities.includes(ability);
});
```

Similar to the `before` method, if the `after` closure returns a non-nullish result that result will be considered the 
result of the authorization check.

## Async Setup

Sometimes, you may want to load the user asynchronously and continue with other configurations in parallel.

```js
import Gate from "authorizer-gate-core";

Gate.setUser(getAsyncUser());
```

You can use the `resolveUser` method and define all steps dependent on the resolved user:

```js
import Gate from "authorizer-gate-core";

Gate.resolveUser()
    .then((user) => {
        // Do the things you should do
    });
```

## Persistence

Sometimes, you may wish to persist. You may use the `persist` method to commit the Gate instance.

In this example, we will determine if the door has not persisted, and only then will we search for the user and then 
persist. We will not need to fetch the user again when reloading or changing the page. 

```js
import Gate from "authorizer-gate-core";

if (Gate.doesntHavePersistence()) {
    Gate.setUser(getAsyncUser())
        .persist();
}
```