addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request, event));
  });
  
  async function handleRequest(request, event) {
    const env = event.env || {}; // 获取 env 对象
    const CUSTOM_NAME = env.CUSTOM_NAME || "域名管理";
    const DOMAINS_JSON = env.DOMAINS_JSON || "https://raw.githubusercontent.com/yutian81/CFTools/main/domain-check/domains.json";
  
    if (!DOMAINS_JSON) {
      return new Response("DOMAINS_JSON 环境变量未设置", { status: 500 });
    }
  
    try {
      const response = await fetch(DOMAINS_JSON);
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const domains = await response.json();
      
      if (!Array.isArray(domains)) {
        throw new Error('JSON 数据格式不正确');
      }
  
      return new Response(generateHTML(domains, CUSTOM_NAME), {
        headers: { 'Content-Type': 'text/html' },
      });
    } catch (error) {
      console.error("Fetch error:", error);
      return new Response("无法获取或解析 domains.json 文件", { status: 500 });
    }
  }
  
  function generateHTML(domains, CUSTOM_NAME) {
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
        <title>${CUSTOM_NAME}</title>
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
  
