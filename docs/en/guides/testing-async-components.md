# Testing Asynchronous Components

> An example project will be made available.

To simplify testing, `vue-test-utils` applies updates _synchronously_. However, there are some techniques you need to be aware ofwhen testing a component with asynchronous behavior such as callbacks or promises.

One common cases is componentst that use `watch`, which updates asynchronously. Below in an example of a component that renders some content based on a boolean value, which is updated using a watcher:

``` js
Demo....
```
The above test fails - however, when you test it by hand in a browser, it seems fine!  The reason the test is failing is because properties inside of `watch` are updated asynchronously. In this test, the assertion occurs before `nextTick()` is called, so the `button` is still not visible.

Most unit test libraries provide a callback to let the runner know when the test is complete. Jest and Karma both use `done()`. We can use this, in combination with `nextTick()`, to test the component.

Now the test passes! 

Another common asynchronous behavior is API calls and Vuex actions. The following examples shows how to test a method that makes an API call. This example is using Jest to run the test and to mock the HTTP library `axios`.

The implementation of the `axios` mock looks like this:

This test currently fails, because the assertion is called before the promise resolves. One solution is to use the npm package, `flush-promises`. which immediately resolve any promises. The test is asynchronous, so like above, we need to let the test runner know to wait. Jest provides a few options, such as `done()`, as shown above. Another is to prepend the test with the ES7 'async' keyword. We can now use the the ES7 `await` keyword with `flushPromises()`, to immediately resolve the API call.

The updated test looks like this:

This same technique can be applied to Vuex actions.

