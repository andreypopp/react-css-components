import React from "react";
import styles from "css";
export function Label({
  variant = {},
  ...props }) {
  let className = styles.Label + (props.level == 1 && props.level < 1 ? ' ' + styles.Label__prop__fe61dd : '') + (props.mode[0] == 1 ? ' ' + styles.Label__prop__7fceb6 : '') + (props.callback() ? ' ' + styles.Label__prop__d033ce : '') + (props.indicies.some(x => x.ok) ? ' ' + styles.Label__prop__29d2fe : '');
  return React.createElement("div", { ...props, className
  });
}
export function Another({
  variant = {},
  ...props }) {
  let className = styles.Another + (props.one < props.another() && (props.two > 2 || props.three == "three") ? ' ' + styles.Another__prop__44eef9 : '');
  return React.createElement("div", { ...props, className
  });
}
