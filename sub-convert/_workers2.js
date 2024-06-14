// 说明
// 这是一个转换订阅链接转换的worker，后端采用边缘的API https://bianyuan.xyz/

// 这里填上你的订阅链接
ssr_sub = ''
v2ray   = ''
// 自定义节点 ssr:// vmess:// 目前就支持填一个，需要更多自己加吧~ 
ssr   = ''
vmess = ''

// worker地址后面写上不同的参数即可获取不同客户端的config链接 https://xxx.xxx.workers.dev/ssr
// ssr 直接输出ssr订阅
// v2  直接输出v2ray订阅
// clash clash
// qx  Quantmultx
// sf  Surfboard
// 如需更多请自行更改程序

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * Respond to the request
 * @param {Request} request
 */
async function handleRequest(request) {

  // get the client type at the end of the URL
  type = request.url.replace(/^https:\/\/.*?\//gi, "")

  if(type == 'ssr'){
    return fetch(ssr)
  }
  if(type == 'v2'){
    return fetch(v2ray)
  }
  // clash不支持ssr
  if(type == 'clash'){

    // build the request link
    req = ''
    // add v2ray
    req = encodeURIComponent(v2ray)
    // add vmess if exist
    if ((req != '') && (vmess != '')){
      req = req + encodeURIComponent('|' + vmess)
    } 
    // add header
    req = 'https://sub.bianyuan.xyz/sub?target=clash&url=' + req

    // fetch & return the config
    return fetch(req)
  }
  if(type == 'qx'){

    // build the request link
    req = ''
    // add v2ray
    req = encodeURIComponent(v2ray)
    // add ssr_sub if exist
    if ((req != '') && (ssr_sub != '')){
      req = req + encodeURIComponent('|' + ssr_sub)
    } 
    // add vmess if exist
    if ((req != '') && (vmess != '')){
      req = req + encodeURIComponent('|' + vmess)
    } 
    // add ssr if exist
    if ((req != '') && (ssr != '')){
      req = req + encodeURIComponent('|' + ssr)
    } 
    // add header
    req = 'https://sub.bianyuan.xyz/sub?target=quanx&url=' + req

    // fetch & return the config
    return fetch(req)
  }
  // surfboard不支持ssr
  if(type == 'sf'){

    // build the request link
    req = ''
    // add v2ray
    req = encodeURIComponent(v2ray)
    // add vmess if exist
    if ((req != '') && (vmess != '')){
      req = req + encodeURIComponent('|' + vmess)
    } 
    // add header
    req = 'https://sub.bianyuan.xyz/sub?target=surfboard&url=' + req

    // fetch & return the config
    return fetch(req)
  }
  
}
