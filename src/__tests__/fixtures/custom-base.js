import React from "react";
import styles from "css";
export function Label({
  variant,
  ...props }) {
  let className = styles.Label;
  return React.createElement("span", { ...props, className
  });
}
