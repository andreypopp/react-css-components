import React from "react";
import styles from "css";
export function Label(props) {
  return React.createElement("div", { ...props, className: styles.Label
  });
}
export function Hint(props) {
  return React.createElement("div", { ...props, className: styles.Hint
  });
}
export function Paragraph(props) {
  return React.createElement("div", { ...props, className: styles.Paragraph
  });
}
export function X(props) {
  return React.createElement("div", { ...props, className: styles.X
  });
}
