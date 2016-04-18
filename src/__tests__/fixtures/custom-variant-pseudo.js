import React from "react";
import styles from "css";
export function Label({
  variant = {},
  ...props }) {
  let className = styles.Label + (variant.custom ? ' ' + styles.Label__custom : '');
  return React.createElement("div", { ...props, className
  });
}
