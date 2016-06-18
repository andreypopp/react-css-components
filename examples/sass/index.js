import React from 'react';
import ReactDOM from 'react-dom';
import {Header, Content, Root} from './styles.react.scss';

ReactDOM.render(
  <Root>
    <Header>Header</Header>
    <Content>Content</Content>
  </Root>,
  document.getElementById('main')
);
