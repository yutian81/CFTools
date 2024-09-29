// 方案1-反代域名-简版(可以page)
export default {
  async fetch(request, env) {
    let url = new URL(request.url);
    url.hostname = 'api.cbcd.com'; // 设置需要反代的地址
    url.protocol = "https";
    return fetch(new Request(url, request));
  },
};

//----------------------------------------------------------------------------
// 方案2-反代伪装域名下某个路径(可以Page)
export default {
  async fetch(request, env) {
    let url = new URL(request.url);
    // 目标网址的域名
    url.hostname = 'cdn.cloudflare.steamstatic.com'; // 设置需要反代的地址
    url.protocol = "https";
    // 目标网址的路径
    url.pathname = '/steam/';
    return fetch(new Request(url, request));
  },
};

