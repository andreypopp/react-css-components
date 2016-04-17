/**
 * @copyright 2016-present, React CSS Components team
 * @flow
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import {render} from '../';

const REACT_CSS_RE = /\.react\.css$/;

declare function describe(description: string, body: any): void;
declare function it(description: string, body: any): void;

describe('react-css-components', function() {

  function readFixture(filename) {
    filename = path.join(__dirname, 'fixtures', filename);
    return fs.readFileSync(filename, 'utf8').trim();
  }

  fs.readdirSync(path.join(__dirname, 'fixtures')).forEach(filename => {

    if (!REACT_CSS_RE.exec(filename)) {
      return;
    }
    let jsExpect = filename.replace(REACT_CSS_RE, '.js');
    let cssExpect = filename.replace(REACT_CSS_RE, '.css');

    it('renders: ' + filename, function() {
      let source = readFixture(filename);
      let {js, css} = render(source, {requestCSS: 'css'});
      assert.equal(js, readFixture(jsExpect));
      assert.equal(css, readFixture(cssExpect));
    });

  });

});
