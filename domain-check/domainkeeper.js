// 在文件顶部添加版本信息后台密码（不可为空）
const VERSION = "1.6.8";

// 自定义标题
const CUSTOM_TITLE = "我的域名管理";

// 在这里设置你的 Cloudflare API Token
const CF_API_KEY = "";

// 自建 WHOIS 代理服务地址
const WHOIS_PROXY_URL = "";

// 访问密码（可为空）
const ACCESS_PASSWORD = "";

// 后台密码（不可为空）
const ADMIN_PASSWORD = "";

// KV 命名空间绑定名称
const KV_NAMESPACE = DOMAIN_INFO;

// footerHTML
const footerHTML = `
  <footer style="
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    background-color: #f8f9fa;
    color: #6c757d;
    text-align: center;
    padding: 10px 0;
    font-size: 14px;
  ">
    Powered by DomainKeeper v${VERSION} <span style="margin: 0 10px;">|</span> © 2023 bacon159. All rights reserved.
  </footer>
`;

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
});

async function handleRequest(request) {
   // 清理KV中的错误内容
   await cleanupKV();
   const url = new URL(request.url);
  const path = url.pathname;

  if (path === "/api/manual-query") {
    return handleManualQuery(request);
  }

  if (path === "/") {
    return handleFrontend(request);
  } else if (path === "/admin") {
    return handleAdmin(request);
  } else if (path === "/api/update") {
    return handleApiUpdate(request);
  } else if (path === "/login") {
    return handleLogin(request);
  } else if (path === "/admin-login") {
    return handleAdminLogin(request);
  } else if (path.startsWith("/whois/")) {
    const domain = path.split("/")[2];
    return handleWhoisRequest(domain);
  } else {
    return new Response("Not Found", { status: 404 });
  }
}

async function handleManualQuery(request) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const data = await request.json();
  const { domain, apiKey } = data;

  try {
    const whoisInfo = await fetchWhoisInfo(domain, apiKey);
    await cacheWhoisInfo(domain, whoisInfo);
    return new Response(JSON.stringify(whoisInfo), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function cleanupKV() {
  const list = await KV_NAMESPACE.list();
  for (const key of list.keys) {
    const value = await KV_NAMESPACE.get(key.name);
    if (value) {
      const { data } = JSON.parse(value);
      if (data.whoisError) {
        await KV_NAMESPACE.delete(key.name);
      }
    }
  }
}

  const adminScript = `
<script>
async function editDomain(domain, button) {
  const row = button.closest('tr');
  const cells = row.querySelectorAll('.editable');
  
  if (button.textContent === '编辑') {
    button.textContent = '保存';
    cells.forEach(cell => {
      const input = document.createElement('input');
      input.value = cell.textContent;
      cell.textContent = '';
      cell.appendChild(input);
    });
  } else {
    button.textContent = '编辑';
    const updatedData = {
      domain: domain,
      registrar: cells[0].querySelector('input').value,
      registrationDate: cells[1].querySelector('input').value,
      expirationDate: cells[2].querySelector('input').value
    };

    try {
      const response = await fetch('/api/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(':${ADMIN_PASSWORD}')
        },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        cells.forEach(cell => {
          cell.textContent = cell.querySelector('input').value;
        });
        alert('更新成功');
      } else {
        throw new Error('更新失败');
      }
    } catch (error) {
      alert('更新失败: ' + error.message);
      location.reload();
    }
  }
}
</script>
`;


async function handleFrontend(request) {
  const cookie = request.headers.get("Cookie");
  if (ACCESS_PASSWORD && (!cookie || !cookie.includes(`access_token=${ACCESS_PASSWORD}`))) {
    return Response.redirect(`${new URL(request.url).origin}/login`, 302);
  }

  console.log("Fetching Cloudflare domains info...");
  const domains = await fetchCloudflareDomainsInfo();
  console.log("Cloudflare domains:", domains);

  console.log("Fetching domain info...");
  const domainsWithInfo = await fetchDomainInfo(domains);
  console.log("Domains with info:", domainsWithInfo);

  return new Response(generateHTML(domainsWithInfo, false), {
    headers: { 'Content-Type': 'text/html' },
  });
}


async function handleAdmin(request) {
  const cookie = request.headers.get("Cookie");
  if (!cookie || !cookie.includes(`admin_token=${ADMIN_PASSWORD}`)) {
    return Response.redirect(`${new URL(request.url).origin}/admin-login`, 302);
  }

  const domains = await fetchCloudflareDomainsInfo();
  const domainsWithInfo = await fetchDomainInfo(domains);
  return new Response(generateHTML(domainsWithInfo, true), {
    headers: { 'Content-Type': 'text/html' },
  });
}

async function handleLogin(request) {
  if (request.method === "POST") {
    const formData = await request.formData();
    const password = formData.get("password");
    
    console.log("Entered password:", password);
    console.log("Expected password:", ACCESS_PASSWORD);
    
    if (password === ACCESS_PASSWORD) {
      return new Response("Login successful", {
        status: 302,
        headers: {
          "Location": "/",
          "Set-Cookie": `access_token=${ACCESS_PASSWORD}; HttpOnly; Path=/; SameSite=Strict`
        }
      });
    } else {
      return new Response(generateLoginHTML("前台登录", "/login", "密码错误，请重试。"), {
        headers: { "Content-Type": "text/html" },
        status: 401
      });
    }
  }
  return new Response(generateLoginHTML("前台登录", "/login"), {
    headers: { "Content-Type": "text/html" }
  });
}


async function handleAdminLogin(request) {
  console.log("Handling admin login request");
  console.log("Request method:", request.method);

  if (request.method === "POST") {
    console.log("Processing POST request for admin login");
    const formData = await request.formData();
    console.log("Form data:", formData);
    const password = formData.get("password");
    console.log("Entered admin password:", password);
    console.log("Expected admin password:", ADMIN_PASSWORD);

    if (password === ADMIN_PASSWORD) {
      return new Response("Admin login successful", {
        status: 302,
        headers: {
          "Location": "/admin",
          "Set-Cookie": `admin_token=${ADMIN_PASSWORD}; HttpOnly; Path=/; SameSite=Strict`
        }
      });
    } else {
      return new Response(generateLoginHTML("后台登录", "/admin-login", "密码错误，请重试。"), {
        headers: { "Content-Type": "text/html" },
        status: 401
      });
    }
  }

  return new Response(generateLoginHTML("后台登录", "/admin-login"), {
    headers: { "Content-Type": "text/html" }
  });
}



async function handleApiUpdate(request) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const auth = request.headers.get("Authorization");
  if (!auth || auth !== `Basic ${btoa(`:${ADMIN_PASSWORD}`)}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const data = await request.json();
    const { action, domain, system, registrar, registrationDate, expirationDate } = data;

    if (action === 'delete') {
      // 删除自定义域名
      await KV_NAMESPACE.delete(`whois_${domain}`);
    } else if (action === 'update-whois') {
      // 更新 WHOIS 信息
      const whoisInfo = await fetchWhoisInfo(domain);
      await cacheWhoisInfo(domain, whoisInfo);
    } else if (action === 'add') {
      // 添加新域名
      const newDomainInfo = {
        domain,
        system,
        registrar,
        registrationDate,
        expirationDate,
        isCustom: true
      };
      await cacheWhoisInfo(domain, newDomainInfo);
    } else {
      // 更新域名信息
      let domainInfo = await getCachedWhoisInfo(domain) || {};
      domainInfo = {
        ...domainInfo,
        registrar,
        registrationDate,
        expirationDate
      };
      await cacheWhoisInfo(domain, domainInfo);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in handleApiUpdate:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}


async function fetchCloudflareDomainsInfo() {
  const response = await fetch('https://api.cloudflare.com/client/v4/zones', {
    headers: {
      'Authorization': `Bearer ${CF_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch domains from Cloudflare');
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error('Cloudflare API request failed');
  }

  return data.result.map(zone => ({
    domain: zone.name,
    registrationDate: new Date(zone.created_on).toISOString().split('T')[0],
    system: 'Cloudflare',
  }));
}


async function fetchDomainInfo(domains) {
  const result = [];
  
  // 获取所有域名信息，包括自定义域名
  const allDomainKeys = await KV_NAMESPACE.list({ prefix: 'whois_' });
  const allDomains = await Promise.all(allDomainKeys.keys.map(async (key) => {
    const value = await KV_NAMESPACE.get(key.name);
    if (value) {
      try {
        const parsedValue = JSON.parse(value);
        return parsedValue.data;
      } catch (error) {
        console.error(`Error parsing data for ${key.name}:`, error);
        return null;
      }
    }
    return null;
  }));

  // 过滤掉无效的域名数据
  const validAllDomains = allDomains.filter(d => d && d.isCustom);

  // 合并 Cloudflare 域名和自定义域名
  const mergedDomains = [...domains, ...validAllDomains];
  
  for (const domain of mergedDomains) {
    if (!domain) continue; // 跳过无效的域名数据

    let domainInfo = { ...domain };

    const cachedInfo = await getCachedWhoisInfo(domain.domain || domain);
    if (cachedInfo) {
      domainInfo = { ...domainInfo, ...cachedInfo };
    } else if (!domainInfo.isCustom && domainInfo.domain && domainInfo.domain.split('.').length === 2 && WHOIS_PROXY_URL) {
      try {
        const whoisInfo = await fetchWhoisInfo(domainInfo.domain);
        domainInfo = { ...domainInfo, ...whoisInfo };
        if (!whoisInfo.whoisError) {
          await cacheWhoisInfo(domainInfo.domain, whoisInfo);
        }
      } catch (error) {
        console.error(`Error fetching WHOIS info for ${domainInfo.domain}:`, error);
        domainInfo.whoisError = error.message;
      }
    }

    result.push(domainInfo);
  }
  return result;
}


async function handleWhoisRequest(domain) {
  console.log(`Handling WHOIS request for domain: ${domain}`);

  try {
    console.log(`Fetching WHOIS data from: ${WHOIS_PROXY_URL}/whois/${domain}`);
    const response = await fetch(`${WHOIS_PROXY_URL}/whois/${domain}`);
    
    if (!response.ok) {
      throw new Error(`WHOIS API responded with status: ${response.status}`);
    }
    
    const whoisData = await response.json();
    console.log(`Received WHOIS data:`, whoisData);
    
    return new Response(JSON.stringify({
      error: false,
      rawData: whoisData.rawData
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(`Error fetching WHOIS data for ${domain}:`, error);
    return new Response(JSON.stringify({
      error: true,
      message: `Failed to fetch WHOIS data for ${domain}. Error: ${error.message}`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function fetchWhoisInfo(domain) {
  try {
    const response = await fetch(`${WHOIS_PROXY_URL}/whois/${domain}`);
    const whoisData = await response.json();

    console.log('Raw WHOIS proxy response:', JSON.stringify(whoisData, null, 2));

    if (whoisData) {
      return {
        registrar: whoisData.registrar || 'Unknown',
        registrationDate: formatDate(whoisData.creationDate) || 'Unknown',
        expirationDate: formatDate(whoisData.expirationDate) || 'Unknown'
      };
    } else {
      console.warn(`Incomplete WHOIS data for ${domain}`);
      return {
        registrar: 'Unknown',
        registrationDate: 'Unknown',
        expirationDate: 'Unknown',
        whoisError: 'Incomplete WHOIS data'
      };
    }
  } catch (error) {
    console.error('Error fetching WHOIS info:', error);
    return {
      registrar: 'Unknown',
      registrationDate: 'Unknown',
      expirationDate: 'Unknown',
      whoisError: error.message
    };
  }
}

function formatDate(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? dateString : date.toISOString().split('T')[0];
}



async function getCachedWhoisInfo(domain) {
  const cacheKey = `whois_${domain}`;
  const cachedData = await KV_NAMESPACE.get(cacheKey);
  if (cachedData) {
    const { data, timestamp } = JSON.parse(cachedData);
    // 检查是否有错误内容，如果有，删除它
    if (data.whoisError) {
      await KV_NAMESPACE.delete(cacheKey);
      return null;
    }
    // 这里可以添加缓存过期检查，如果需要的话
    return data;
  }
  return null;
}


async function cacheWhoisInfo(domain, whoisInfo) {
  const cacheKey = `whois_${domain}`;
  await KV_NAMESPACE.put(cacheKey, JSON.stringify({
    data: whoisInfo,
    timestamp: Date.now()
  }));
}


function generateLoginHTML(title, action, errorMessage = "") {
  return `
  <!DOCTYPE html>
  <html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - ${CUSTOM_TITLE}</title>
    <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 20px;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 1600px;
      width: 100%;
      margin: 0 auto;
      background-color: #fff;
      padding: 20px;
      border-radius: 5px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      margin-bottom: 60px;
    }
    .table-wrapper {
      overflow-x: auto;
      width: 100%;
    }
    
    table {
      width: 100%;
      table-layout: auto;
    }

    thead {
      position: sticky;
      top: 0;
      background-color: #f2f2f2;
      z-index: 1;
    }

    th, td {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      padding: 8px;
    }
    
    .status-column { width: 30px; min-width: 30px; max-width: 50px; }
    .domain-column { max-width: 200px; }
    .system-column, .registrar-column { max-width: 150px; }
    .date-column { max-width: 100px; }
    .days-column { max-width: 80px; }
    .progress-column { max-width: 150px; }
    .operation-column { max-width: 200px; }
    
    @media (max-width: 768px) {
      .container {
        padding: 0 10px;
      }
    
      table {
        table-layout: auto;
        font-size: 12px;
      }
      
      th, td {
        padding: 6px;
      }
    
      .system-column, .registrar-column {
        display: none;
      }
      
      .domain-column, 
      .date-column, 
      .days-column, 
      .progress-column, 
      .operation-column { 
        width: auto; 
      }
    
      button {
        padding: 3px 6px;
        font-size: 12px;
      }
    }
    
    @media (min-width: 1921px) {
      .container {
        max-width: 1800px;
      }
    }

    .status-dot {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .progress-bar {
      width: 100%;
      background-color: #e0e0e0;
      border-radius: 5px;
      overflow: hidden;
    }
    .progress {
      height: 20px;
      background-color: #4CAF50;
      transition: width 0.5s ease-in-out;
    }
    button {
      padding: 5px 10px;
      margin: 2px;
      cursor: pointer;
    }
    
    </style>
  </head>
  <body>
    <div class="login-container">
      <h1>${title}</h1>
      ${errorMessage ? `<p class="error-message">${errorMessage}</p>` : ''}
      <form method="POST" action="${action}">
        <input type="password" name="password" placeholder="请输入密码" required>
        <input type="submit" value="登录">
      </form>
    </div>
    ${footerHTML}
  </body>
  </html>
  `;
}

function getStatusColor(daysRemaining) {
  if (daysRemaining === 'N/A' || daysRemaining <= 0) return '#e74c3c'; // 红色
  if (daysRemaining <= 30) return '#f1c40f'; // 黄色
  return '#2ecc71'; // 绿色
}

function getStatusTitle(daysRemaining) {
  if (daysRemaining === 'N/A') return '无效的到期日期';
  if (daysRemaining <= 0) return '已过期';
  if (daysRemaining <= 30) return '即将过期';
  return '正常';
}

function generateHTML(domains, isAdmin) {
  const categorizedDomains = categorizeDomains(domains);
    
  console.log("Categorized domains:", categorizedDomains);
  const generateTable = (domainList, isCFTopLevel) => {
    if (!domainList || !Array.isArray(domainList)) {
      console.error('Invalid domainList:', domainList);
      return '';
    }
    return domainList.map(info => {
      const today = new Date();
      const expirationDate = new Date(info.expirationDate);
      const daysRemaining = info.expirationDate === 'Unknown' ? 'N/A' : Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24));
      const totalDays = info.registrationDate === 'Unknown' || info.expirationDate === 'Unknown' ? 'N/A' : Math.ceil((expirationDate - new Date(info.registrationDate)) / (1000 * 60 * 60 * 24));
      const progressPercentage = isNaN(daysRemaining) || isNaN(totalDays) ? 0 : 100 - (daysRemaining / totalDays * 100);
      const whoisErrorMessage = info.whoisError 
        ? `<br><span style="color: red;">WHOIS错误: ${info.whoisError}</span><br><span style="color: blue;">建议：请检查域名状态或API配置</span>`
        : '';
  
      let operationButtons = '';
      if (isAdmin) {
        if (isCFTopLevel) {
          operationButtons = `
            <button onclick="editDomain('${info.domain}', this)">编辑</button>
            <button data-action="update-whois" data-domain="${info.domain}">更新WHOIS信息</button>
            <button data-action="query-whois" data-domain="${info.domain}">查询WHOIS信息</button>
          `;
        } else {
          operationButtons = `
            <button onclick="editDomain('${info.domain}', this)">编辑</button>
            <button onclick="deleteDomain('${info.domain}')">删除</button>
          `;
        }
      }
  
      return `
        <tr data-domain="${info.domain}">
          <td class="status-column"><span class="status-dot" style="background-color: ${getStatusColor(daysRemaining)};" title="${getStatusTitle(daysRemaining)}"></span></td>
          <td class="domain-column" title="${info.domain}">${info.domain}</td>
          <td class="system-column" title="${info.system}">${info.system}</td>
          <td class="registrar-column editable" title="${info.registrar}${whoisErrorMessage}">${info.registrar}${whoisErrorMessage}</td>
          <td class="date-column editable" title="${info.registrationDate}">${info.registrationDate}</td>
          <td class="date-column editable" title="${info.expirationDate}">${info.expirationDate}</td>
          <td class="days-column" title="${daysRemaining}">${daysRemaining}</td>
          <td class="progress-column">
            <div class="progress-bar">
              <div class="progress" style="width: ${progressPercentage}%;" title="${progressPercentage.toFixed(2)}%"></div>
            </div>
          </td>
          ${isAdmin ? `<td class="operation-column">${operationButtons}</td>` : ''}
        </tr>
      `;
    }).join('');
  };

  const cfTopLevelTable = generateTable(categorizedDomains.cfTopLevel, true);
  const cfSecondLevelAndCustomTable = generateTable(categorizedDomains.cfSecondLevelAndCustom, false);

  const adminLink = isAdmin 
    ? '<span>当前为后台管理页面</span> | <a href="/">返回前台</a>' 
    : '<a href="/admin">进入后台管理</a>';

  return `
  <!DOCTYPE html>
  <html lang="zh-CN">
  <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${CUSTOM_TITLE}${isAdmin ? ' - 后台管理' : ''}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 20px;
      background-color: #f4f4f4;
    }
    .container {
      margin: 0 auto;
      padding: 0 15px;
    }

    .container {
    padding-bottom: 60px; /* 根据页脚高度调整 */
    }

    footer {
      position: relative;
      left: 0;
      bottom: 0;
      width: 100%;
    }

    .table-wrapper {
      width: 100%;
      overflow-x: auto;
    }
  
    h2.table-title {
      font-size: 1.5em;
      margin-top: 30px;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #ddd;
    }
  
    .table-separator {
      height: 2px;
      background-color: #eee;
      margin: 30px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      table-layout: auto;
    }
    th, td {
      padding: 8px;
      text-align: left;
      border-bottom: 1px solid #ddd;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    th {
      background-color: #f2f2f2;
      font-weight: bold;
    }
    .status-column { width: 30px; min-width: 30px; max-width: 50px; }
    .domain-column { min-width: 120px; max-width: 25%; }
    .system-column, .registrar-column { min-width: 80px; max-width: 15%; }
    .date-column { min-width: 90px; max-width: 12%; }
    .days-column { min-width: 60px; max-width: 10%; }
    .progress-column { min-width: 100px; max-width: 20%; }
    .operation-column { min-width: 120px; max-width: 20%; }
    .status-dot {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .progress-bar {
      width: 100%;
      background-color: #e0e0e0;
      border-radius: 5px;
      overflow: hidden;
    }
    .progress {
      height: 20px;
      background-color: #4CAF50;
      transition: width 0.5s ease-in-out;
    }
    button {
      padding: 5px 10px;
      margin: 2px;
      cursor: pointer;
    }
    .section-header {
      background-color: #e9ecef;
      font-weight: bold;
    }
    .section-header td {
      padding: 10px;
    }
    @media (max-width: 768px) {
      table {
        font-size: 12px;
      }
      th, td {
        padding: 6px;
      }
      .system-column, .registrar-column {
        display: none;
      }
      .operation-column {
        width: auto;
      }
      button {
        padding: 3px 6px;
        font-size: 12px;
      }
      .less-important-column {
        display: none;
      }
    }
  </style>
  </head>
  <body>
    <div class="container">
        <h1>${CUSTOM_TITLE}${isAdmin ? ' - 后台管理' : ''}</h1>
        <div class="admin-link">${adminLink}</div>
  
        <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th class="status-column">状态</th>
              <th class="domain-column">域名</th>
              <th class="system-column">系统</th>
              <th class="registrar-column">注册商</th>
              <th class="date-column">注册日期</th>
              <th class="date-column">到期日期</th>
              <th class="days-column">剩余天数</th>
              <th class="progress-column">进度</th>
              ${isAdmin ? '<th class="operation-column">操作</th>' : ''}
            </tr>
          </thead>
          <tbody>
            <tr class="section-header"><td colspan="${isAdmin ? '9' : '8'}"><h2>CF顶级域名</h2></td></tr>
            ${cfTopLevelTable}
            <tr class="section-separator"><td colspan="${isAdmin ? '9' : '8'}"></td></tr>
            <tr class="section-header"><td colspan="${isAdmin ? '9' : '8'}"><h2>CF二级域名or自定义域名</h2></td></tr>
            ${cfSecondLevelAndCustomTable}
          </tbody>
        </table>
      </div>
  
      ${isAdmin ? `
        <div>
          <h2>添加CF二级域名or自定义域名</h2>
          <form id="addCustomDomainForm">
            <input type="text" id="newDomain" placeholder="域名" required>
            <input type="text" id="newSystem" placeholder="系统" required>
            <input type="text" id="newRegistrar" placeholder="注册商" required>
            <input type="date" id="newRegistrationDate" required>
            <input type="date" id="newExpirationDate" required>
            <button type="submit">添加</button>
          </form>
        </div>
      ` : ''}
    </div>
    <script>
  

    async function editDomain(domain, button) {
      const row = button.closest('tr');
      const cells = row.querySelectorAll('.editable');
      
      if (button.textContent === '编辑') {
        button.textContent = '保存';
        cells.forEach(cell => {
          const input = document.createElement('input');
          input.value = cell.textContent;
          cell.textContent = '';
          cell.appendChild(input);
        });
      } else {
        button.textContent = '编辑';
        const updatedData = {
          domain: domain,
          registrar: cells[0].querySelector('input').value,
          registrationDate: cells[1].querySelector('input').value,
          expirationDate: cells[2].querySelector('input').value
        };
    
        try {
          const response = await fetch('/api/update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Basic ' + btoa(':${ADMIN_PASSWORD}')
            },
            body: JSON.stringify(updatedData)
          });
    
          if (response.ok) {
            cells.forEach(cell => {
              cell.textContent = cell.querySelector('input').value;
            });
            alert('更新成功');
          } else {
            throw new Error('更新失败');
          }
        } catch (error) {
          alert('更新失败: ' + error.message);
          location.reload();
        }
      }
    }
    
    async function deleteDomain(domain) {
      if (confirm('确定要删除这个域名吗？')) {
        try {
          const response = await fetch('/api/update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Basic ' + btoa(':${ADMIN_PASSWORD}')
            },
            body: JSON.stringify({
              action: 'delete',
              domain: domain
            })
          });
    
          if (response.ok) {
            alert('删除成功');
            location.reload();
          } else {
            throw new Error('删除失败');
          }
        } catch (error) {
          alert('删除失败: ' + error.message);
        }
      }
    }
    
    document.addEventListener('click', function(event) {
      if (event.target.dataset.action === 'update-whois') {
        updateWhoisInfo(event.target.dataset.domain);
      } else if (event.target.dataset.action === 'query-whois') {
        queryWhoisInfo(event.target.dataset.domain);
      }
    });
    
    async function updateWhoisInfo(domain) {
      try {
        const response = await fetch('/api/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(':${ADMIN_PASSWORD}')
          },
          body: JSON.stringify({
            action: 'update-whois',
            domain: domain
          })
        });
    
        if (response.ok) {
          alert('WHOIS信息更新成功');
          location.reload();
        } else {
          throw new Error('WHOIS信息更新失败');
        }
      } catch (error) {
        alert('WHOIS信息更新失败: ' + error.message);
      }
    }
    
    async function queryWhoisInfo(domain) {
      try {
        const response = await fetch('/whois/' + domain);
        const data = await response.json();
    
        if (data.error) {
          alert('查询WHOIS信息失败: ' + data.message);
        } else {
          alert('WHOIS信息：\\n' + data.rawData);
        }
      } catch (error) {
        alert('查询WHOIS信息失败: ' + error.message);
      }
    }

    ${isAdmin ? `
      document.getElementById('addCustomDomainForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const domain = document.getElementById('newDomain').value;
        const system = document.getElementById('newSystem').value;
        const registrar = document.getElementById('newRegistrar').value;
        const registrationDate = document.getElementById('newRegistrationDate').value;
        const expirationDate = document.getElementById('newExpirationDate').value;

        fetch('/api/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(':' + '${ADMIN_PASSWORD}')
          },
          body: JSON.stringify({
            action: 'add',
            domain: domain,
            system: system,
            registrar: registrar,
            registrationDate: registrationDate,
            expirationDate: expirationDate
          })
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            alert('添加成功');
            location.reload();
          } else {
            alert('添加失败');
          }
        })
        .catch(error => {
          console.error('Error:', error);
          alert('添加失败');
        });
      });
    ` : ''}
    </script>
    ${footerHTML}
    </body>
  </html>
  `;
}


function getStatusColor(daysRemaining) {
  if (isNaN(daysRemaining)) return '#808080'; // 灰色表示未知状态
  if (daysRemaining <= 7) return '#ff0000'; // 红色
  if (daysRemaining <= 30) return '#ffa500'; // 橙色
  if (daysRemaining <= 90) return '#ffff00'; // 黄色
  return '#00ff00'; // 绿色
}

function getStatusTitle(daysRemaining) {
  if (isNaN(daysRemaining)) return '未知状态';
  if (daysRemaining <= 7) return '紧急';
  if (daysRemaining <= 30) return '警告';
  if (daysRemaining <= 90) return '注意';
  return '正常';
}

function categorizeDomains(domains) {
  if (!domains || !Array.isArray(domains)) {
    console.error('Invalid domains input:', domains);
    return { cfTopLevel: [], cfSecondLevelAndCustom: [] };
  }

  return domains.reduce((acc, domain) => {
    if (domain.system === 'Cloudflare' && domain.domain.split('.').length === 2) {
      acc.cfTopLevel.push(domain);
    } else {
      acc.cfSecondLevelAndCustom.push(domain);
    }
    return acc;
  }, { cfTopLevel: [], cfSecondLevelAndCustom: [] });
}
