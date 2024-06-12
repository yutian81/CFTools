addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    let url = new URL(request.url);
    
    // 设置目标主机名和协议
    url.hostname = "yourdomain.com"; // 复制你的域名
    url.protocol = "https";
    
    // 创建一个新的请求对象，保持原请求的所有参数
    let newRequest = new Request(url, request);
    
    // 发送请求并返回响应
    return fetch(newRequest);
}
