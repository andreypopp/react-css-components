import React from "react";
import styles from "css";
export function Label({
  variant = {},
  ...props }) {
  let className = styles.Label + (variant.hover ? ' ' + styles.Label__hover : '');
  return React.createElement("div", { ...props, className
  });
}
