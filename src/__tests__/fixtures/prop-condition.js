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
  var className = styles.Label + (props.level == 1 && props.level < 1 ? ' ' + styles.Label__prop__fe61dd : '') + (props.mode[0] == 1 ? ' ' + styles.Label__prop__7fceb6 : '') + (props.callback() ? ' ' + styles.Label__prop__d033ce : '') + (props.indicies.some(x => x.ok) ? ' ' + styles.Label__prop__29d2fe : '');
  return React.createElement("div", reconcileProps(props, className));
};

module.exports.Another = function Another(props) {
  var variant = props.variant || {};
  var className = styles.Another + (props.one < props.another() && (props.two > 2 || props.three == "three") ? ' ' + styles.Another__prop__44eef9 : '');
  return React.createElement("div", reconcileProps(props, className));
};
