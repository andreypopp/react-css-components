## 0.2.0

* [FEATURE] When specifying `base` for a styled component it is treated as an
  import specification if it doesn't represent an HTML tag name.

  For example:

      Label {
        base: mylib/Label;
        color: red;
      }

  Will generate a CSS class and inject it to component imported from
  `mylib/Label` module.

## 0.1.0

* [FEATURE] Initial release.
