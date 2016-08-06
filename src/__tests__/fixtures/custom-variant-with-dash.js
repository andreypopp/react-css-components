var React = require("react");

var styles = require("css");

function reconcileProps(props, className) {
  var nextProps = {};

  for (var k in props) {
    if (k === 'variant') {
      continue;
    }

    if (props.hasOwnProperty(k)) {
      nextProps[k] = props[k];
    }
  }

  nextProps.className = className;
  return nextProps;
}

module.exports.Label = function Label(props) {
  var variant = props.variant || {};
  var className = styles.Label + (variant.veryLargeText ? ' ' + styles.Label__veryLargeText : '');
  return React.createElement("div", reconcileProps(props, className));
};
