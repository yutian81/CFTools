// 自定义标题
const CUSTOM_TITLE = "我的域名管理";

// 域名信息
const DOMAINS = [
  { domain: "example.com", registrationDate: "2022-01-01", expirationDate: "2027-01-01", system: "Cloudflare" },
  { domain: "example.org", registrationDate: "2021-06-15", expirationDate: "2026-06-15", system: "GoDaddy" },
  { domain: "example.net", registrationDate: "2021-06-15", expirationDate: "2024-06-15", system: "GoDaddy" },
  // 在这里添加更多域名
];

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
});

async function handleRequest(request) {
  return new Response(generateHTML(), {
    headers: { 'Content-Type': 'text/html' },
  });
}

function generateHTML() {
  const rows = DOMAINS.map(info => {
    const registrationDate = new Date(info.registrationDate);
    const expirationDate = new Date(info.expirationDate);
    const today = new Date();
    const totalDays = (expirationDate - registrationDate) / (1000 * 60 * 60 * 24);
    const daysElapsed = (today - registrationDate) / (1000 * 60 * 60 * 24);
    const progressPercentage = Math.min(100, Math.max(0, (daysElapsed / totalDays) * 100));
    const daysRemaining = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24));
    
    // 判断域名是否过期
    const isExpired = today > expirationDate;
    const statusColor = isExpired ? '#e74c3c' : '#2ecc71';
    const statusText = isExpired ? '已过期' : '正常';
    
    return `
      <tr>
        <td><span class="status-dot" style="background-color: ${statusColor};" title="${statusText}"></span></td>
        <td>${info.domain}</td>
        <td>${info.system}</td>
        <td>${info.registrationDate}</td>
        <td>${info.expirationDate}</td>
        <td>${isExpired ? '已过期' : daysRemaining + ' 天'}</td>
        <td>
          <div class="progress-bar">
            <div class="progress" style="width: ${progressPercentage}%;"></div>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  return `
  <!DOCTYPE html>
  <html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${CUSTOM_TITLE}</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
        color: #333;
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }
      .container {
        flex: 1;
        width: 95%;
        max-width: 1200px;
        margin: 20px auto;
        background-color: #fff;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        border-radius: 5px;
        overflow: hidden;
      }
      h1 {
        background-color: #3498db;
        color: #fff;
        padding: 20px;
        margin: 0;
      }
      .table-container {
        width: 100%;
        overflow-x: auto;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        white-space: nowrap;
      }
      th, td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #ddd;
      }
      th {
        background-color: #f2f2f2;
        font-weight: bold;
      }
      .status-dot {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: #2ecc71;
      }
      .progress-bar {
        width: 100%;
        min-width: 100px;
        background-color: #e0e0e0;
        border-radius: 4px;
        overflow: hidden;
      }
      .progress {
        height: 20px;
        background-color: #3498db;
      }
      .footer {
        text-align: center;
        padding: 10px;
        background-color: #3498db;
        color: #fff;
        margin-top: auto;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>${CUSTOM_TITLE}</h1>
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
      powered by domainkeeper v1.1.0 | 作者：bacon159
    </div>
  </body>
  </html>
`;
}
