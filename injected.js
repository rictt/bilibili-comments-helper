/**
 * 重写ajax方法，以便在请求结束后通知content_script
 * inject_script无法直接与background通信，所以先传到content_script，再通过他传到background
 */

(function () {
  'use strict';

  const MessageTypes = {
    REQUEST: "networkRequest"
  }
  const paths = [
    'reply/wbi/main',
    'reply/reply'
  ]

  const postMessage = (type, data) => {
    console.log(`post type: ${type} to *`)
    window.postMessage({
      type: type,
      data: data
    }, '*')
  }

  function getQueryParams(url) {
    const paramArr = url.slice(url.indexOf("?") + 1).split("&");
    const params = {};
    paramArr.map((param) => {
      const [key, val] = param.split("=");
      params[key] = decodeURIComponent(val);
    });
    return params;
  }
  
  function extractFormData(url, options) {
    const query = getQueryParams(url)
    return query
  }

  const originFetch = fetch;
  window.fetch = (url, options) => {
    return originFetch(url, options).then(async (response) => {
      for (const keyword of paths) {
        if (url.indexOf(keyword) !== -1) {
          const responseClone = response.clone();
          const res = await responseClone.json();
          const query = extractFormData(url, options)
          postMessage(MessageTypes.REQUEST, {
            data: res,
            query,
            url,
          })
        }
      }
      return response
    });
  };

  const originOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (_, url) {
    this.addEventListener("readystatechange", function () {
      if (this.readyState === 4) {
        for (const keyword of paths) {
          if (url.indexOf(keyword) !== -1) {
            const query = extractFormData(url, {})
            postMessage(MessageTypes.REQUEST, { 
              data: this.response,
              query,
              url
            })
          }
        }
      }
    })
    originOpen.apply(this, arguments);
  };

})();