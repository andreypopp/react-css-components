import React from "react";
import styles from "css";
export function Label({
  variant = {},
  ...props }) {
  let className = styles.Label + (variant.important ? ' ' + styles.Label__important : '') + (variant.shadow ? ' ' + styles.Label__shadow : '');
  return React.createElement("div", { ...props, className
  });
}
