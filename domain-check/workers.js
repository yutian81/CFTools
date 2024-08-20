// 从环境变量中读取自定义标题和 GitHub RAW 文件的链接
const CUSTOM_NAME = ENV.CUSTOM_NAME || "域名监控";
const DOMAINS_JSON = ENV.DOMAINS_JSON || ""; // 留空字符串作为默认值

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
});

async function handleRequest(request) {
  if (!DOMAINS_JSON) {
    return new Response("DOMAINS_JSON 环境变量未设置", { status: 500 });
  }

  try {
    const response = await fetch(DOMAINS_JSON);
    const domains = await response.json();

    return new Response(generateHTML(domains), {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    return new Response("无法获取 domains.json 文件", { status: 500 });
  }
}

function generateHTML(domains) {
  const rows = domains.map(info => {
    // 生成表格行的代码
  }).join('');

  return `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${CUSTOM_NAME}</title>
      <style>
        /* 样式代码省略 */
      </style>
    </head>
    <body>
      <div class="container">
        <h1>${CUSTOM_NAME}</h1>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>状态</th>
                <th>域名</th>
                <th>域名注册商</th>
                <th>注册时间</th>
                <th>过期时间</th>
                <th>剩余天数</th>
                <th>使用进度</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
      </div>
      <div class="footer">
        powered by yutian81 | <a href="https://www.how2html.com">作者的 GITHUB</a>
      </div>
    </body>
    </html>
  `;
}
