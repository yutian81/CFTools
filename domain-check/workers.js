const CUSTOM_NAME = "域名监控";

// GitHub RAW 文件的链接
const DOMAINS_JSON = "https://github.com/your-username/your-repo/raw/main/domains.json";

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const domains = await fetchDomainsFromGitHub();
  const html = generateHTML(domains);
  
  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}

async function fetchDomainsFromGitHub() {
  try {
    const response = await fetch(GITHUB_JSON_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch data from GitHub: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching domains:', error);
    return [];  // 如果获取失败，返回空数组
  }
}

function generateHTML(domains) {
  const rows = domains.map(info => {
    const registrationDate = new Date(info.registrationDate);
    const expirationDate = new Date(info.expirationDate);
    const today = new Date();
    const totalDays = (expirationDate - registrationDate) / (1000 * 60 * 60 * 24);
    const daysElapsed = (today - registrationDate) / (1000 * 60 * 60 * 24);
    const progressPercentage = Math.min(100, Math.max(0, (daysElapsed / totalDays) * 100));
    const daysRemaining = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24));

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
      /* 样式保持不变 */
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
