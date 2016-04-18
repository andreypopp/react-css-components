import React from "react";
import styles from "css";
import { Label as Label__Base } from "lib";
export function Label({
  variant = {},
  ...props }) {
  let className = styles.Label;
  return React.createElement(Label__Base, { ...props, className
  });
}
