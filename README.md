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

[package-url]: https://npmjs.org/package/react-formulaic
[npm-version-svg]: http://versionbadg.es/simonify/react-formulaic.svg
[deps-svg]: https://david-dm.org/simonify/react-formulaic.svg
[deps-url]: https://david-dm.org/simonify/react-formulaic
[dev-deps-svg]: https://david-dm.org/simonify/react-formulaic/dev-status.svg
[dev-deps-url]: https://david-dm.org/simonify/react-formulaic#info=devDependencies
[npm-badge-png]: https://nodei.co/npm/react-formulaic.png?downloads=true&stars=true
[license-image]: http://img.shields.io/npm/l/react-formulaic.svg
[license-url]: LICENSE
[downloads-image]: http://img.shields.io/npm/dm/react-formulaic.svg
[downloads-url]: http://npm-stat.com/charts.html?package=react-formulaic
