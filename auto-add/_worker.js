addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // 定义你要自动访问的多个网址
  const urls = [
    'https://yutian.nyc.mn/',
    'https://yuzong.nyc.mn/',
    'https://vps.yutian81.top/',
    'https://domains.yutian81.top/'
  ];

  // 遍历每个网址并发送请求
  for (const url of urls) {
    fetch(url).then(response => {
      // 这里不需要处理返回内容，所以不做任何操作
      console.log(`Successfully accessed ${url}`);
    }).catch(error => {
      // 如果有错误，记录日志
      console.error(`Error accessing ${url}: `, error);
    });
  }

  // 返回一个简单的响应，表示请求已经发起
  return new Response('All URLs have been accessed.', {
    headers: { 'content-type': 'text/plain' }
  });
}
