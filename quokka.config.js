module.exports = {
  // говорим Quokka, что нужно грузить jsdom перед кодом
  setup() {
    const { JSDOM } = require('jsdom');
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');

    global.window = dom.window;
    global.document = dom.window.document;
    global.navigator = {
      userAgent: 'node.js',
    };
  },
};
