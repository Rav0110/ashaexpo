/**
 * Minimal URL polyfill for Hermes engine.
 * Hermes doesn't implement the WHATWG URL API which expo-asset uses internally.
 * This MUST be imported/required before expo-sqlite or expo-asset.
 */

if (typeof URLSearchParams === 'undefined') {
  class URLSearchParams {
    constructor(search) {
      this._params = {};
      if (search) {
        String(search).replace(/^\?/, '').split('&').forEach(pair => {
          const [k, v] = pair.split('=');
          if (k) this._params[decodeURIComponent(k)] = decodeURIComponent(v || '');
        });
      }
    }
    has(key) { return key in this._params; }
    get(key) { return this._params[key] ?? null; }
    toString() {
      return Object.entries(this._params).map(([k,v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
    }
  }
  globalThis.URLSearchParams = URLSearchParams;
}

if (typeof URL === 'undefined') {
  class URL {
    constructor(url, base) {
      let input = String(url);
      if (base && !/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(input)) {
        input = String(base).replace(/\/+$/, '') + '/' + input.replace(/^\/+/, '');
      }
      const match = input.match(/^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/);
      this.href = input;
      this.protocol = (match && match[2] ? match[2] : 'https') + ':';
      this.host = (match && match[4]) || '';
      this.hostname = this.host.split(':')[0];
      this.port = this.host.split(':')[1] || '';
      this.pathname = (match && match[5]) || '/';
      this.search = (match && match[6]) || '';
      this.hash = (match && match[8]) || '';
      this.origin = this.protocol + '//' + this.host;
      this.searchParams = new URLSearchParams(this.search.replace(/^\?/, ''));
    }
    toString() { return this.href; }
  }
  globalThis.URL = URL;
}
