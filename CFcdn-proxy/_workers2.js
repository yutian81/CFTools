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
    // 目标网址的域名、协议和路径
    url.hostname = 'cdn.cloudflare.steamstatic.com';
    url.protocol = "https";
    url.pathname = '/steam/';
    return fetch(new Request(url, request));
  },
};

//--------------------------------------------------------------------------
//方案3-反代伪装域名下某个路径(可以Page)-外部自定义变量
//变量名：HOSTNAME，变量值：需要反代的域名，不要http(s)
//变量名：PROTOCOL，变量值：传输协议，填http或https
//变量名：PATHNAME，变量值：域名后的路径，不用带/，代码会自动在前面附加/
export default {
  async fetch(request, env) {
    let url = new URL(request.url);
    // 使用外部环境变量，如果未定义，则使用默认值
    url.hostname = env.HOSTNAME || 'cdn.cloudflare.steamstatic.com';
    url.protocol = env.PROTOCOL || 'https';
    let pathname = env.PATHNAME || 'steam';
    url.pathname = `/${pathname}`; // 给外部变量值自动附加前斜杠 
    return fetch(new Request(url, request));
  },
};
