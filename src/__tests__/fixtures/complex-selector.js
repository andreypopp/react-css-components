import React from "react";
import styles from "css";
export function Label({
  variant,
  ...props }) {
  let className = styles.Label;
  return React.createElement("div", { ...props, className
  });
}
export function Hint({
  variant,
  ...props }) {
  let className = styles.Hint;
  return React.createElement("div", { ...props, className
  });
}
export function Paragraph({
  variant,
  ...props }) {
  let className = styles.Paragraph;
  return React.createElement("div", { ...props, className
  });
}
export function X({
  variant,
  ...props }) {
  let className = styles.X + (variant.hover ? ' ' + styles.X__hover : '');
  return React.createElement("div", { ...props, className
  });
}
