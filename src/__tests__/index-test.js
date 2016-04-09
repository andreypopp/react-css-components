import {render} from '../';

describe('react-css-components', function() {

  it('renders react compoents', function() {
    let {js, css} = render(`

Label {
  color: red;
}
    `, {requestCSS: 'react-css-components?css!styles.react.css'});
    console.log('--- js');
    console.log(js);
    console.log('--- css');
    console.log(css);
  });


  it('renders react components with pseudoclasses', function() {
    let {js, css} = render(`

Label {
  color: red;
  :hover {
    color: white;
  }
}
    `, {requestCSS: 'react-css-components?css!styles.react.css'});
    console.log('--- js');
    console.log(js);
    console.log('--- css');
    console.log(css);
  });

  it.only('renders react components with nested pseudoclasses', function() {
    let {js, css} = render(`

Label {
  color: red;
  :hover {
    color: white;
    :focus {
      color: black;
    }
  }
}
    `, {requestCSS: 'react-css-components?css!styles.react.css'});
    console.log('--- js');
    console.log(js);
    console.log('--- css');
    console.log(css);
  });
});
