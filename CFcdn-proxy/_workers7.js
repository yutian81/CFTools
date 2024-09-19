addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)

  // 检查路径是否是 AList 图片服务
  if (url.pathname.startsWith('/img')) {
    // 将 '/img' 替换为 AList 图片的直链路径
    const targetUrl = 'https://p****--alist--sykk8bwr425w.code.run/dav/阿里图片' + url.pathname.replace('/img', '')
    return proxyRequest(targetUrl, request)
  }

  // 默认图床服务路径
  const targetUrl = 'https://p****--lskypro--sykk8bwr425w.code.run' + url.pathname
  return proxyRequest(targetUrl, request)
}

async function proxyRequest(targetUrl, originalRequest) {
  const init = {
    method: originalRequest.method,
    headers: originalRequest.headers,
    body: originalRequest.body,
    redirect: 'manual'
  }
  const response = await fetch(targetUrl, init)

  // 返回从目标服务器获取的响应
  return new Response(response.body, {
    status: response.status,
    headers: response.headers
  })
}
