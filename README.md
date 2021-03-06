[![npm](https://img.shields.io/npm/v/snekfetch.svg?maxAge=3600)](https://www.npmjs.com/package/snekfetch)
[![npm](https://img.shields.io/npm/dt/snekfetch.svg?maxAge=3600)](https://www.npmjs.com/package/snekfetch)
[![David](https://david-dm.org/guscaplan/snekfetch.svg)](https://david-dm.org/guscaplan/snekfetch)

[![NPM](https://nodei.co/npm/snekfetch.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/snekfetch/)

# snekfetch

Snekfetch is a fast, efficient, and user-friendly library for making HTTP requests.

The API was inspired by superagent, however it is much smaller and faster.
In fact, in browser, it is a mere 8kb.

Documentation is available at https://snekfetch.js.org/

## Some examples

```javascript
const snekfetch = require('snekfetch');

snekfetch.get('https://s.gus.host/o-SNAKES-80.jpg')
  .then(r => fs.writeFile('download.jpg', r.body));

snekfetch.get('https://s.gus.host/o-SNAKES-80.jpg')
  .pipe(fs.createWriteStream('download.jpg'));
```

```javascript
const snekfetch = require('snekfetch');

snekfetch.post('https://httpbin.org/post')
  .send({ meme: 'dream' })
  .then(r => console.log(r.body));
```

