# react-formulaic <sup>[![Version Badge][npm-version-svg]][package-url]</sup>

[![dependency status][deps-svg]][deps-url]
[![dev dependency status][dev-deps-svg]][dev-deps-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]

[![npm badge][npm-badge-png]][package-url]

> A set of React components for easy form management ⚛️

## Live Playground

For examples of what react-formulaic can be used for, go to https://simonify.github.io/react-formulaic.

OR

To run that demo on your own computer:
* Clone this repository
* `npm install`
* `npm run storybook`
* Visit http://localhost:6006/

## Getting Started
### Install dependencies
Ensure packages are installed with correct version numbers by running:
```sh
(
  export PKG=react-formulaic;
  npm info "$PKG" peerDependencies --json | command sed 's/[\{\},]//g ; s/: /@/g; s/ *//g' | xargs npm install --save "$PKG"
)
```

Which produces and runs a command like:

```sh
npm install --save react-formulaic react@>=#.## react-dom@>=#.## ...
```

### Using

react-formulaic provides a small set of components, which can be composed together to create powerful forms. Form state can be stored in a backend of your choice.

Out of the box, react-formulaic provides a `StatefulForm` component which simply stores the form state in local component state. There are third-party modules available for storing state in other backends, such as [react-formulaic-redux](https://github.com/simonify/react-formulaic-redux) which stores form state in redux.

## Components

### `BaseForm`
### `StatefulForm`
### `FormsContext`
### `FormProvider`
### `Field`
### `CancelButton`
### `CommitButton`
### `CommitStatus`
### `FieldErrors`
### `DirtyField`
### `InvalidField`
### `FieldState`

[package-url]: https://npmjs.org/package/react-formulaic
[npm-version-svg]: http://versionbadg.es/simonify/react-formulaic.svg
[deps-svg]: https://david-dm.org/simonify/react-formulaic.svg
[deps-url]: https://david-dm.org/simonify/react-formulaic
[dev-deps-svg]: https://david-dm.org/simonify/react-formulaic/dev-status.svg
[dev-deps-url]: https://david-dm.org/simonify/react-formulaic#info=devDependencies
[npm-badge-png]: https://nodei.co/npm/react-formulaic.png?downloads=true&amp;stars=true
[license-image]: http://img.shields.io/npm/l/react-formulaic.svg
[license-url]: LICENSE
[downloads-image]: http://img.shields.io/npm/dm/react-formulaic.svg
[downloads-url]: http://npm-stat.com/charts.html?package=react-formulaic
