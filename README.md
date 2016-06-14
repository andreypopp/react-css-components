# React CSS components

[![Travis build status](https://img.shields.io/travis/andreypopp/react-css-components/master.svg)](https://travis-ci.org/andreypopp/react-css-components)
[![npm](https://img.shields.io/npm/v/react-css-components.svg)](https://www.npmjs.com/package/react-css-components)

## Motivation

Define React presentational components with CSS.

The implementation is based on [CSS modules][]. In fact React CSS Components is
just a thin API on top of CSS modules.

**NOTE:** The current implementation is based on Webpack but everything is ready
to be ported onto other build systems (generic API is here just not yet
documented). Raise an issue or better submit a PR if you have some ideas.

## Installation & Usage

Install from npm:

    % npm install react-css-components

Configure in `webpack.config.js`:

```js
module.exports = {
  ...
  module: {
    loaders: [
      {
        test: /\.react.css$/,
        loader: 'babel-loader!react-css-components/webpack',
      }
    ]
  }
  ...
}
```
Now you can author React components in `Styles.react.css`:
```css
Label {
  color: red;
}

Label:hover {
  color: white;
}
```

And consume them like regular React components:
```js
import {Label} from './styles.react.css'

<Label /> // => <div className="<autogenerated classname>">...</div>
```
## Variants

You can define additional styling variants for your components:
```css
Label {
  color: red;
}

Label:emphasis {
  font-weight: bold;
}
```

They are compiled as CSS classes which then can be controlled from JS via
`variant` prop:
```js
<Label variant={{emphasis: true}} /> // sets both classes with `color` and `font-weight`
```
## Prop variants

You can define variants which are based on some JavaScript expression against
props:
```css
Label {
  color: red;
}

Label:prop(mode == "emphasis") {
  font-weight: bold;
}
```
They are compiled as CSS classes which then can be controlled from JS:
```js
<Label mode="emphasis" /> // sets both classes with `color` and `font-weight`
```

## TODO

* [ ] Document how to add PostCSS transform to build pipeline (think autoprefixer).

[CSS modules]: https://github.com/css-modules/css-modules
