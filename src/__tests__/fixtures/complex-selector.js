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
  var className = styles.Label;
  return React.createElement("div", reconcileProps(props, className));
};

module.exports.Hint = function Hint(props) {
  var variant = props.variant || {};
  var className = styles.Hint;
  return React.createElement("div", reconcileProps(props, className));
};

module.exports.Paragraph = function Paragraph(props) {
  var variant = props.variant || {};
  var className = styles.Paragraph;
  return React.createElement("div", reconcileProps(props, className));
};

module.exports.X = function X(props) {
  var variant = props.variant || {};
  var className = styles.X + (variant.hover ? ' ' + styles.X__hover : '');
  return React.createElement("div", reconcileProps(props, className));
};
