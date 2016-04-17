import React from "react";
import styles from "css";
export function Label({
  variant,
  ...props }) {
  let className = styles.Label + (variant.important ? ' ' + styles.Label__important : '');
  return React.createElement("div", { ...props, className
  });
}
