const expect = require('chai').expect;
const bible = require('../src/bible')();

describe('Bible', () => {
  describe('.search', () => {
    it('does return the passage formatted', () => {
      return bible.search('Jn15:17').then((results) => {
        expect(results[0].value).to.include('αγαπατε');
        expect(results[0].value).to.include('<h1>John</h1>');
        expect(results[0].value).to.include('<h2> 15</h2>');
        expect(results[0].value).to.include('<b>17</b>');
      });
    });
  });
});
