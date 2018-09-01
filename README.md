# Sig Rewrite
`sig-rewrite` contains a handful of tools for redefining function signatures in order to produce more legible and
maintainable code while minimizing boilerplate.

[![Build Status](https://travis-ci.org/maxwellgerber/sig-rewrite.svg?branch=master)](https://travis-ci.org/maxwellgerber/sig-rewrite)
[![codecov](https://codecov.io/gh/maxwellgerber/sig-rewrite/branch/master/graph/badge.svg)](https://codecov.io/gh/maxwellgerber/sig-rewrite)

## Docs
#### `sigRewrite(fn, opts)`
Return a wrapped version of `fn` with a different signature, as dictated by `opts`. Parameters that may be set on opts:
* `opts.toOptions` `bool|String[]` 
  * if true - function signature is replaced by a dictionary where all keys map to positional parameters of the same name. 
    * ex: `fn(foo, bar, baz, wux) => fn({foo, bar, baz})`
  * If an array - positional parameters in the array are joined into an options object, and all other parameters are pushed to the left
    * ex: `fn(foo, bar, baz, wux) => fn(foo, baz, {bar, wux})`
* `opts.toBuilderPattern` `bool`
  * Return a builder instance with methods attached as demonstrated [below](#sample-usage-2---builder-dsl-syntax-for-free:)
* `opts.builderTemplate` `function(string) => string`
  * A function for templating the names of the methods attached to the builder instance
  * Default `param => "with" + toCamelCase(param)`
* `opts.isConstructor` `bool` Whether or not `fn` must be invoked with the `new` keyword
* `opts.defaults` `object` A map of param names to a default value that should be provided to them
  * The default value will be reused across all function calls, so be careful with passing in mutable objects

At least argument in (`toOptions`, `toBuilderpattern`, `defaults`) is required

## Motivation

Some JS modules are guilty of exposing a function that takes in an astounding amount of arguments.

E.g. [oauth.js](https://github.com/ciaranj/node-oauth/blob/0707eb851b22e045d72c7e09b1f0d2b14f4feb4c/lib/oauth.js#L9)

```javascript
exports.OAuth= function(
   requestUrl, accessUrl, consumerKey, consumerSecret, 
   version, authorize_callback, signatureMethod, 
   nonceSize, customHeaders
 ) {...};

exports.OAuth2= function(
  clientId, clientSecret, baseSite, authorizePath, 
  accessTokenPath, customHeaders
) {...};
``` 

When too many arguments are passed in, the usage becomes difficult to understand unless you are staring directly at the
docs. Passing in null or undefined values in order to pass in later positional arguments is needless boilerplate.
 
Take this example - if you wanted to pass in a `customHeaders` argument it would take 4 positional nulls to do so.
```javascript
const oauth = new OAuth.OAuth(
  'https://api.twitter.com/oauth/request_token',
  'https://api.twitter.com/oauth/access_token',
  'your application consumer key',
  'your application secret',
  null,
  null,
  null,
  null,
  {header: 'my-custom-header'}
);
```

Sig Rewrite offers a handful of tools to allow library users to redefine function signatures for improved readability.

### Sample Usage 1 - grouping function arguments into an option object:
```javascript
const oauth = sigRewrite(Oauth.Oauth, {
  toOptions: ['version', 'authorize_callback', 'signatureMethod', 'nonceSize', 'customHeaders'],
  isConstructor: true
});

const headers = {header: 'my-custom-header'};

oauth(
  'https://api.twitter.com/oauth/request_token',
  'https://api.twitter.com/oauth/access_token',
  'your application consumer key',
  'your application secret',
  {customHeaders: headers}
);
```

### Sample Usage 2 - Builder DSL syntax for free:
```javascript
const oauthBuilder = sigRewrite(Oauth.Oauth, {
  toBuilderPattern: true,
  isConstructor: true
});

const oauth = oauthBuilder
  .withRequestUrl('https://api.twitter.com/oauth/request_token')
  .withAccessUrl('https://api.twitter.com/oauth/access_token')
  .withConsumerKey('your application consumer key')
  .withConsumerSecret('your application secret')
  .withCustomHeaders({header: 'my-custom-header'})
  .build();

oauth();
```

### Sample Usage 3 - More Powerful Currying Patterns
```javascript
function mrManyArguments(arg1, arg2, arg3, arg4, arg5) {
  console.log(arguments.join(', '));
}

const fn = sigRewrite(mrManyArguments, {
  defaults: {
    arg3: 'arg3',
    arg5: 'arg5'
  },
  toOptions: true
});

fn({
  arg1: 'arg1',
  arg2: 'then arg2', 
  arg5:'not default'
});
// "arg1, then arg2, arg3, , not default",  
```

## Notes
Usage with ES6 classes is not supported directly. The constructor may be wrapped first in order to facilitate rewriting.

```javascript
class foo{
  constructor(bar, baz, wux) {
    ...
  }
}
// invalid
sigRewrite(fooFactory, opts);

const fooFactory = (bar, baz, wux) => new foo(...arguments);
// valid
sigRewrite(fooFactory, opts);
``` 

Usage with ES6 unpacking and default syntax is similarly unsupported.
```javascript
function myFunction(foo, bar, [baz, wux], {opt1, opt2}) {
  ...
}
// invalid
sigRewrite(myFunction, opts);

const wrapper = (foo, bar, arr, obj) => myFunction(...arguments);
// valid
sigRewrite(wrapper, opts);
```
