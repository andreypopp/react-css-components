import React from "react";
import styles from "css";
import { default as Label__Base } from "somelib/Label";
export function Label({
  variant,
  ...props }) {
  let className = styles.Label;
  return React.createElement(Label__Base, { ...props, className
  });
}
