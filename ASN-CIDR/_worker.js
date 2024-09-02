// 定义一个函数，用来从HTML字符串中提取IPv4的CIDR
function extractIPv4CIDRs(html) {
  // 创建一个空的Set对象，用来存放不重复的CIDR
  let result = new Set();
  // 创建一个正则表达式，用来匹配IPv4的CIDR
  let regex = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/\d{1,2})/g;
  // 使用正则表达式在HTML字符串中查找所有的匹配项
  let match = regex.exec(html);
  // 循环遍历所有的匹配项
  while (match) {
    // 把匹配项的第一个分组（即IPv4的CIDR）添加到Set对象中
    result.add(match[1]);
    // 继续查找下一个匹配项
    match = regex.exec(html);
  }
  // 返回Set对象转换成的数组
  return [...result];
}

// 定义一个函数，用来处理请求
async function handleRequest(request) {
  // 获取请求的URL
  let url = new URL(request.url);
  // 获取URL后面的ASN号
  let asn = url.pathname.slice(1);
  // 如果ASN号不为空
  if (asn) {
    // 拼接一个新的URL，用来访问asnlookup.com
    let newUrl = "https://asnlookup.com/asn/" + asn;
    // 发送一个GET请求，获取响应内容
    let response = await fetch(newUrl);
    let html = await response.text();
    // 从响应内容中提取IPv4的CIDR
    let cidrs = extractIPv4CIDRs(html);
    // 把结果数组转换成字符串，每个元素占一行
    let output = cidrs.join("\n");
    // 返回一个新的响应，包含结果字符串
    return new Response(output, {
      headers: { "content-type": "text/plain" },
    });
  } else {
    // 如果ASN号为空，返回一个错误信息
    return new Response("Please provide an ASN number", {
      status: 400,
      statusText: "Bad Request",
    });
  }
}

// 监听请求事件，调用处理函数
addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});
