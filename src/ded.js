(function() {
  const browser = typeof window !== 'undefined';

  let fetch;
  let FormData;
  let Package;
  if (browser) {
    fetch = window.fetch; // eslint-disable-line no-undef
    FormData = window.FormData; // eslint-disable-line no-undef
  } else {
    fetch = require('node-fetch');
    FormData = require('./FormData');
    Package = require('../package.json');
  }

  class Snekfetch {
    constructor(method, url) {
      this.url = url;
      this.method = method.toUpperCase();
      this.headers = {};
      this.data = null;
    }

    set(name, value) {
      if (name !== null && typeof name === 'object') {
        for (const key of Object.keys(name)) this.set(key, name[key]);
      } else {
        this.headers[name] = value;
      }
      return this;
    }

    attach(name, data, filename) {
      const form = this._getFormData();
      this.set('Content-Type', `multipart/form-data; boundary=${form.boundary}`);
      form.append(name, data, filename);
      this.data = form;
      return this;
    }

    send(data) {
      if (typeof data === 'object') {
        this.set('Content-Type', 'application/json');
        this.data = JSON.stringify(data);
      } else {
        this.data = data;
      }
      return this;
    }

    end(cb) {
      const recv = {
        text: '',
        body: {},
      };
      if (!Object.keys(this.headers).map(h => h.toLowerCase()).includes('user-agent')) {
        this.set('User-Agent', `snekfetch/${Snekfetch.version} (https://github.com/guscaplan/snekfetch)`);
      }
      const data = this.data ? this.data.end ? this.data.end() : this.data : null;
      return fetch(this.url, {
        method: this.method,
        headers: this.headers,
        body: data,
      }).then((res) => {
        const ctype = res.headers.get('Content-Type');
        if (ctype.includes('application/json')) {
          return res.text().then((t) => {
            recv.text = t;
            recv.body = JSON.parse(t);
            return res;
          });
        } else if (ctype.includes('application/x-www-form-urlencoded')) {
          return res.text().then((t) => {
            recv.text = t;
            recv.body = parseWWWFormUrlEncoded(t);
            return res;
          });
        } else {
          return (browser ? res.arrayBuffer() : res.buffer())
          .then((b) => {
            if (b instanceof ArrayBuffer) b = convertToBuffer(b);
            recv.body = b;
            recv.text = b.toString();
            return res;
          });
        }
      })
      .then((res) => {
        const response = Object.assign({}, res);
        response.body = recv.body;
        response.text = recv.text;
        response.raw = res.body;
        response.headers = {};
        if (res.headers.raw) {
          const headers = res.headers.raw();
          for (const key of Object.keys(headers)) response.headers[key] = headers[key][0];
        } else {
          for (const [name, value] of res.headers.entries()) response.headers[name] = value;
        }
        if (!res.ok) return Promise.reject(response);
        return cb(null, response);
      })
      .catch((err) => {
        let error = err;
        if (err.statusText) {
          error = new Error(`${err.status} ${err.statusText}`.trim());
          error.response = err;
          cb(error, err);
        } else {
          cb(error);
        }
      });
    }

    then(s, f) {
      return new Promise((resolve, reject) => {
        this.end((err, res) => {
          if (err) reject(f ? f(err) : err);
          else resolve(s ? s(res) : res);
        });
      });
    }

    catch(f) {
      return this.then(null, f);
    }

    _getFormData() {
      if (!this._formData) this._formData = new FormData();
      return this._formData;
    }
  }

  if (!browser) Snekfetch.version = Package.version;

  const methods = ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE', 'PATCH', 'BREW'];
  for (let method of methods) {
    method = method.toLowerCase();
    Snekfetch[method] = (url) => new Snekfetch(method, url);
    if (browser) continue;
    Snekfetch[`${method}Sync`] = (url, options = {}) => {
      options.url = url;
      options.method = method;
      const cp = require('child_process');
      const result = JSON.parse(
        cp.execSync(`node ${__dirname}/index.js`, {
          env: { __SNEKFETCH_IS_HISSING_AT_YOU: JSON.stringify(options) },
        }).toString(),
        (k, v) => {
          if (v === null) return v;
          if (v.type === 'Buffer' && Array.isArray(v.data)) return new Buffer(v.data);
          if (v.__CONVERT_TO_ERROR) {
            const e = new Error();
            for (const key of Object.keys(v)) {
              if (key === '__CONVERT_TO_ERROR') continue;
              e[key] = v[key];
            }
            return e;
          }
          return v;
        }
      );
      if (result.error) throw result.error;
      return result;
    };
  }

  if (!browser && process.env.__SNEKFETCH_IS_HISSING_AT_YOU) {
    const options = JSON.parse(process.env.__SNEKFETCH_IS_HISSING_AT_YOU);
    const request = Snekfetch[options.method](options.url);
    if (options.headers) request.set(options.headers);
    if (options.body) request.send(options.body);
    if (options.form) {
      for (const key of Object.keys(options.form)) request.attach(key, options[key].name, options[key].filename);
    }
    request.end((err, res = {}) => {
      if (err) {
        const alt = {};
        for (const name of Object.getOwnPropertyNames(err)) alt[name] = err[name];
        res.error = alt;
        res.error.__CONVERT_TO_ERROR = true;
      }
      process.stdout.write(JSON.stringify(res));
    });
  }

  if (browser) window.Snekfetch = Snekfetch;
  if (typeof module !== 'undefined') module.exports = Snekfetch;

  function convertToBuffer(ab) {
    function str2ab(str) {
      const buffer = new ArrayBuffer(str.length * 2);
      const view = new Uint16Array(buffer);
      for (var i = 0, strLen = str.length; i < strLen; i++) view[i] = str.charCodeAt(i);
      return buffer;
    }

    if (typeof ab === 'string') ab = str2ab(ab);
    return Buffer.from(ab);
  }

  function parseWWWFormUrlEncoded(str) {
    const obj = {};
    for (const [k, v] of str.split('&').map(q => q.split('='))) obj[k] = v;
    return obj;
  }
}());