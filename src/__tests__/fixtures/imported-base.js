import React from "react";
import styles from "css";
import Label__Base from "somelib/Label";
export function Label(props) {
  return React.createElement(Label__Base, { ...props, className: styles.Label
  });
}
