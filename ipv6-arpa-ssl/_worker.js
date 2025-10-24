export default {
  async fetch(request, env, ctx) {
      const url = new URL(request.url);

      // 处理 API 请求：支持 POST (/api/add-ssl) 和 GET (/?...)
      if (
          (url.pathname === '/api/add-ssl' && request.method === 'POST') ||
          (url.pathname === '/' && request.method === 'GET' && url.searchParams.has('zoneId'))
      ) {
          return handleApiRequest(request, url.searchParams);
      }

      // 返回 HTML 页面 (仅当是根路径的 GET 请求且没有API参数时)
      return new Response(getHTML(), {
          headers: {
              'Content-Type': 'text/html; charset=utf-8',
          },
      });
  },
};

// 统一处理 API 请求（支持 POST Body 和 GET Query Params）
async function handleApiRequest(request, queryParams) {
  let email, zone_id, api_key, enabled, certificate_authority;

  try {
      if (request.method === 'POST') {
          // POST 请求：从请求体中解析 JSON
          const body = await request.json();
          email = body.email;
          zone_id = body.zoneId;
          api_key = body.apikey;
          enabled = body.enabled !== undefined ? body.enabled : true;
          certificate_authority = body.ca || "ssl_com";
      } else if (request.method === 'GET') {
          // GET 请求：从 URL 查询参数中获取
          email = queryParams.get('email');
          zone_id = queryParams.get('zoneId');
          api_key = queryParams.get('apikey');
          enabled = !(queryParams.get('enabled') === 'false');
          certificate_authority = queryParams.get('ca') || "ssl_com";
      }

      // 验证必需的输入
      if (!email || !zone_id || !api_key) {
          return new Response(JSON.stringify({
              success: false,
              errors: ['邮箱、区域ID和API密钥都是必需的']
          }), {
              status: 400,
              headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
          }
          });
      }
      
      // 验证并设置 CA 默认值
      const validCAs = ["ssl_com", "lets_encrypt", "google", "sectigo"];
      const caToUse = validCAs.includes(certificate_authority) ? certificate_authority : "ssl_com";

      // 调用 Cloudflare API
      const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zone_id}/ssl/universal/settings`, {
          method: 'PATCH',
          headers: {
              'X-Auth-Email': email,
              'X-Auth-Key': api_key,
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              enabled: enabled,
              certificate_authority: caToUse
          }),
      });

      const result = await response.json();

      // 为 API 调用返回 JSON 响应
      return new Response(JSON.stringify(result), {
          headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST',
              'Access-Control-Allow-Headers': 'Content-Type',
          },
      });

  } catch (error) {
      return new Response(JSON.stringify({
          success: false,
          errors: [{ message: `请求失败: ${error.message || '未知错误'}` }]
      }), {
          status: 500,
          headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
          }
      });
  }
}

// getHTML 函数保持不变，因为前端表单仍然使用 POST 请求
function getHTML() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IP6.ARPA域名自动添加SSL证书</title>
  <meta name="description" content="一键为您的 IP6.ARPA 反向解析域名自动申请和配置 Cloudflare 通用 SSL 证书，同时提供 IP6.ARPA 域名生成工具。">
  <link rel="icon" href="https://tunnelbroker.net/favicon.ico" type="image/ico">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer" />
  <style>
    * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    
    body {
        background: url('https://pan.811520.xyz/icon/bg_light.webp') no-repeat center/cover;
        color: #333;
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 10px;
    }
    
    .container {
        background: rgba(255, 255, 255, 0.3);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border-radius: 12px;
        box-shadow: 8px 8px 15px rgba(0, 0, 0, 0.15);
        width: 100%;
        max-width: 840px;
        padding: 30px;
        margin: 30px;
    }
    
    h1 {
      text-align: center;
      margin-bottom: 25px;
      color: white;
      font-size: 36px;
      position: relative;
      padding-bottom: 15px;
      text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7); 
    }
 
    /* CSS for two-column layout */
    .form-row {
        display: flex;
        justify-content: space-between;
        gap: 20px;
        margin-bottom: 20px;
    }
    
    .form-group.half-width {
        flex: 1;
        margin-bottom: 0;
    }
    
    .ca-select-style {
        width: 100%; 
        padding: 12px 15px; 
        border: 2px solid #e0e0e0; 
        border-radius: 8px; 
        font-size: 16px;
        transition: all 0.3s;
    }
    
    .ca-select-style:focus {
        border-color: #3498db;
        box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
        outline: none;
    }
     
    .registration-buttons {
      display: flex;
      justify-content: space-between;
      gap: 15px;
      margin-bottom: 25px;
   }

    .register-btn {
        flex: 1;
        display: block;
        background: #0D627E;
        color: white;
        text-align: center;
        text-decoration: none;
        border-radius: 8px;
        padding: 10px 15px;
        font-size: 16px;
        font-weight: 600;
        transition: all 0.3s;
        box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.15);
    }
    
    .register-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    }
    
    .form-group {
        margin-bottom: 20px;
    }
    
    label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        color: #2c3e50;
    }
    
    input[type="text"], 
    input[type="email"],
    textarea,
    .ca-select-style {
        width: 100%;
        padding: 12px 15px;
        background: rgba(255, 255, 255, 0.35); 
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
        border: 1px solid rgba(255, 255, 255, 0.4); 
        border-radius: 8px; 
        font-size: 16px;
        color: #2c3e50;
        transition: all 0.3s;
        resize: none;
    }
    
    .ca-select-style {
        height: 48px;
    }

    input[type="text"]:focus, 
    input[type="email"]:focus,
    textarea:focus,
    .ca-select-style:focus {
        border-color: #3498db;
        box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
        outline: none;
        background: rgba(255, 255, 255, 0.5); 
    }
    
    .error {
        border-color: #e74c3c !important;
        box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.2) !important;
    }
    
    .error-message {
        color: #e74c3c;
        font-size: 14px;
        margin-top: 5px;
        display: none;
    }
    
    .btn {
        background: #0D627E;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 14px 20px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        width: 100%;
        transition: all 0.3s;
        display: flex;
        justify-content: center;
        align-items: center;
        box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.15);
    }

    .info-box .btn#generate-btn { margin-top: 15px; }
    .info-box .btn#generate-btn i { position: relative; top: 1px; }
    
    .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }
    
    .btn:active {
        transform: translateY(0);
    }
    
    .spinner {
        display: none;
        width: 20px;
        height: 20px;
        border: 3px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 1s ease-in-out infinite;
        margin-right: 10px;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    .result {
        margin-top: 20px;
        padding: 15px;
        border-radius: 8px;
        display: none;
        text-align: center;
        font-weight: 600;
    }
    
    .success {
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
    }
    
    .error-result {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }
    
    .info-box {
        background: rgba(255, 255, 255, 0.35);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border-left: 4px solid #3498db;
        padding: 15px;
        margin-top: 25px;
        border-radius: 8px;
    }
    
    .info-box h2 {
        color: #2c3e50;
        margin-bottom: 10px;
        font-size: 20px;
    }
    
    .info-box p {
        font-size: 14px;
        line-height: 1.5;
        color: #34495e;
    }

    .footer {
      text-align: center;
      margin-top: 20px;
      font-size: 14px;
      color: #444;
    }
    .footer a {
      color: inherit;
      text-decoration: none;
      transition: color 0.3s;
    }
    .footer a:hover {
     color: #3498db;
    }
    .separator {
      padding: 0 5px; 
      color: inherit; 
      display: inline-block;
    }

    /* 响应式调整：在小屏幕上变回单列布局 */
    @media (max-width: 600px) {
      .form-row { flex-direction: column; gap: 0; }
      .form-group.half-width { margin-bottom: 20px; }
      .footer { font-size: 0.8em; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>IP6.ARPA域名自动添加SSL证书</h1>
    
    <div class="registration-buttons">
      <a href="https://tb.netassist.ua" class="register-btn" target="_blank"><i class="fas fa-registered"></i> ip6.arpa 注册地址1</a>
      <a href="https://dns.he.net" class="register-btn" target="_blank"><i class="fas fa-registered"></i> ip6.arpa 注册地址2</a>
      <a href="https://tunnelbroker.net/" class="register-btn" target="_blank"><i class="fas fa-registered"></i> ip6.arpa 注册地址3</a>
    </div>
    
    <form id="ssl-form">
      <div class="form-row">
          <div class="form-group half-width">
              <label for="email"><i class="fas fa-envelope"></i> Cloudflare注册邮箱 (Email)</label>
              <input type="email" id="email" placeholder="请输入您的Cloudflare邮箱">
              <div class="error-message" id="email-error">请输入有效的邮箱地址</div>
          </div>
          
          <div class="form-group half-width">
              <label for="zone-id"><i class="fas fa-id-card"></i> 区域ID (Zone ID)</label>
              <input type="text" id="zone-id" placeholder="请输入您的区域ID">
              <div class="error-message" id="zone-id-error">请输入区域ID</div>
          </div>
      </div>
      
      <div class="form-row">
          <div class="form-group half-width">
              <label for="api-key"><i class="fas fa-key"></i> 全局API密钥 (API Key)</label>
              <input type="text" id="api-key" placeholder="请输入您的API密钥">
              <div class="error-message" id="api-key-error">请输入API密钥</div>
          </div>
          
          <div class="form-group half-width">
              <label for="ca-select"><i class="fas fa-landmark"></i> CA证书颁发机构</label>
              <select id="ca-select" class="ca-select-style">
                  <option value="ssl_com">SSL.com (默认)</option>
                  <option value="lets_encrypt">Let's Encrypt</option>
                  <option value="google">Google Trust Services</option>
                  <option value="sectigo">Sectigo</option>
              </select>
          </div>
      </div>

      <button type="submit" class="btn" id="submit-btn">
          <div class="spinner" id="spinner"></div>
          <span id="btn-text"><i class="fas fa-plus-circle"></i> 添加 SSL 证书</span>
      </button>
    </form>
    
    <div class="result" id="result-message"></div>

    <div class="info-box">
      <h2>IP6.ARPA 域名生成工具</h2>
      <div class="form-row" style="margin-top: 15px;">
        <div class="form-group half-width">
          <label for="ipv6-cidr"><i class="fas fa-network-wired"></i> 输入 IPv6 CIDR 地址</label>
          <input type="text" id="ipv6-cidr" placeholder="请输入 IPv6 CIDR, 例如: 2001:DB8::/48">
          <div class="error-message" id="ipv6-cidr-error">请输入有效的 IPv6 CIDR</div>
          <button type="button" class="btn" id="generate-btn"><i class="fas fa-sync-alt"></i>&nbsp;生成 IP6.ARPA 域名</button>
        </div>
        <div class="form-group half-width">
          <label for="generated-domain"><i class="fas fa-check-circle"></i> IP6.ARPA 域名生成结果</label>
          <textarea id="generated-domain" readonly rows="4" placeholder="生成结果将显示在这里"></textarea> 
        </div>
      </div>
    </div>    

    <div class="info-box">
      <h2>API GET 调用示例</h2>
      <p style="font-size: 14px; margin-bottom: 10px;">证书颁发机构 (ca) 支持：<code>ssl_com</code>、<code>lets_encrypt</code>、<code>google</code>、<code>sectigo</code>。<strong>注意：ip6.arpa 域名通常仅支持 <code>ssl_com</code>。</strong></p>
      <pre style="background: rgba(255, 255, 255, 0.7); padding: 10px; border-radius: 6px; font-size: 14px; overflow-x: auto; color: #000;">https://worker地址/?zoneId=...&email=...&apikey=...&enabled=true&ca=ssl_com</pre>
    </div>

    <div class="footer">
      <i class="fas fa-copyright"></i> Copyright 2025 <span class="separator">|</span>
      <a href="https://github.com/yutian81/CFTools/tree/main/ipv6-arpa-ssl" target="_blank"><i class="fab fa-github"></i> GitHub</a> <span class="separator">|</span>
      <a href="https://blog.811520.xyz/" target="_blank"><i class="fas fa-blog"></i> QingYun Blog</a>
    </div>
  </div>

  <script>
  // ==========================================================
  // 域名生成逻辑 (支持随机子域名生成)
  // ==========================================================

  // 辅助函数：将缩写的 IPv6 地址展开为完整的 32 位十六进制字符串
  function expandIpv6(ipv6) {
      ipv6 = ipv6.toLowerCase();

      // 检查是否有 '::' 缩写
      if (!ipv6.includes('::')) {
          return ipv6.split(':').map((block) => block.padStart(4, '0')).join('');
      }

      const parts = ipv6.split('::');
      const leftBlocks = parts[0].split(':').filter(Boolean);
      const rightBlocks = parts[1].split(':').filter(Boolean);

      const existingBlocksCount = leftBlocks.length + rightBlocks.length;
      const zeroBlocksCount = 8 - existingBlocksCount;

      if (zeroBlocksCount < 0) {
          throw new Error('IPv6 地址块过多，格式错误。');
      }

      const zeroPadding = Array(zeroBlocksCount).fill('0000').join('');

      // 填充左侧和右侧的块，然后合并
      const fullLeft = leftBlocks.map((block) => block.padStart(4, '0')).join('');
      const fullRight = rightBlocks.map((block) => block.padStart(4, '0')).join('');
      return fullLeft + zeroPadding + fullRight;
  }

  // 辅助函数：生成指定长度的随机十六进制字符串
  function randomHex(length) {
      let result = '';
      const characters = '0123456789abcdef';
      for (let i = 0; i < length; i++) {
          result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return result;
  }

  // 生成 ipv6 反向根域名
  function generateArpaRootDomain(cidr) {
      const parts = cidr.split('/');

      if (parts.length !== 2) {
          throw new Error('CIDR 格式不正确，请使用 IP/前缀长度 格式。');
      }

      const ipv6 = parts[0].trim();
      const prefixLength = parseInt(parts[1], 10);

      if (isNaN(prefixLength) || prefixLength < 0 || prefixLength > 128 || prefixLength % 4 !== 0) {
          throw new Error('前缀长度无效，必须是 4 的倍数 (例如: /32, /48, /64)。');
      }

      const fullHex = expandIpv6(ipv6); // 获取完整的 32 字符十六进制地址
      const hexCharsInPrefix = prefixLength / 4; // 截取固定的网络前缀部分
      const networkPrefix = fullHex.substring(0, hexCharsInPrefix);
      const reversed = networkPrefix.split('').reverse().join('.'); // 反转并用 '.' 分隔
      return reversed + '.ip6.arpa'; // 拼接后缀
  }

  // 生成随机前缀域名
  function generateRandomPrefixDomains(baseArpaDomain) {
      const domains = [baseArpaDomain]; // 根域名

      for (let i = 0; i < 3; i++) {
          // 生成 1 到 4 位长的随机十六进制字符串
          const randomLength = Math.floor(Math.random() * 4) + 1; // 1 to 4
          const prefix = randomHex(randomLength).split('').join('.');
          domains.push(prefix + '.' + baseArpaDomain); 
      }
      return domains;
  }

  // ==========================================================
  // DOM 交互逻辑
  // ==========================================================

  // 辅助函数：从本地存储加载 CIDR
  function loadSavedCidr() {
      const savedCidr = localStorage.getItem('ipv6Cidr');
      if (savedCidr) {
          document.getElementById('ipv6-cidr').value = savedCidr;
      }
  }

  // 辅助函数：保存 CIDR 到本地存储
  function saveCidr(cidr) {
      localStorage.setItem('ipv6Cidr', cidr);
  }

  // 辅助函数：显示字段错误
  function showError(fieldId, message) {
      const field = document.getElementById(fieldId);
      const errorElement = document.getElementById(fieldId + '-error');

      field.classList.add('error');
      errorElement.textContent = message;
      errorElement.style.display = 'block';
      if (!document.querySelector('.error:focus')) {
          field.focus();
      }
  }

  // 辅助函数：重置所有错误状态
  function resetErrors() {
      const errorFields = document.querySelectorAll('.error');
      const errorMessages = document.querySelectorAll('.error-message');
      errorFields.forEach((field) => {
          field.classList.remove('error');
      });
      errorMessages.forEach((message) => {
          message.style.display = 'none';
      });
  }

  // 辅助函数：显示操作结果
  function showResult(message, type) {
      const resultElement = document.getElementById('result-message');
      resultElement.textContent = message;
      resultElement.className = 'result';
      resultElement.classList.add(type === 'success' ? 'success' : 'error-result');
      resultElement.style.display = 'block';
      resultElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // 辅助函数：执行复制操作 (仅使用 Clipboard API)
  async function copyTextToClipboard(text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
          try {
              await navigator.clipboard.writeText(text);
              return true;
          } catch (err) {
              console.warn('Clipboard API 复制失败或权限被拒绝:', err);
              return false;
          }
      } else {
          console.warn('浏览器不支持 navigator.clipboard API。');
          return false;
      }
  }

  // ==========================================================
  // 页面初始化和事件监听
  // ==========================================================
  document.addEventListener('DOMContentLoaded', function () {
      // 1. 加载保存的 CIDR
      loadSavedCidr();

      // 2. 监听 CIDR 输入，实时保存
      document.getElementById('ipv6-cidr').addEventListener('input', function (e) {
          saveCidr(e.target.value.trim());
      });

      // 3. 事件监听: IPv6 域名生成 (调用随机生成函数)
      document.getElementById('generate-btn').addEventListener('click', async function () {
          resetErrors();
          const cidrInput = document.getElementById('ipv6-cidr');
          const domainOutput = document.getElementById('generated-domain');
          const cidr = cidrInput.value.trim();
          domainOutput.value = '';

          if (!cidr) {
              showError('ipv6-cidr', '请输入 IPv6 CIDR 地址。');
              return;
          }

          try {
              const rootDomain = generateArpaRootDomain(cidr); // 生成 ARPA 根域名
              const generatedDomains = generateRandomPrefixDomains(rootDomain); // 生成包含根域名和随机前缀的 4 个域名列表
              const resultText = generatedDomains.join('\\n'); // 将所有域名格式化成多行文本
              domainOutput.value = resultText; // 将所有 4 个域名赋值给 textarea
              const copySuccess = await copyTextToClipboard(resultText); // 复制操作 (复制所有 4 个域名)

              let resultMessage = 'IP6.ARPA 域名生成成功！共生成 4 个域名。';
              if (copySuccess) {
                  resultMessage += '所有域名已自动复制到剪贴板。';
              } else {
                  resultMessage += '自动复制失败，请手动复制文本框中的内容。';
              }
              showResult(resultMessage, 'success');
              console.log("生成的 4 个域名:\\n" + resultText);
          } catch (error) {
              showError('ipv6-cidr', error.message || '生成域名失败, 请检查CIDR格式。');
              showResult('生成失败: ' + (error.message || '未知错误'), 'error');
          }
        });

      // 4. 事件监听: Cloudflare SSL 提交
      document.getElementById('ssl-form').addEventListener('submit', async function (e) {
          e.preventDefault();

          // 获取输入值
          const email = document.getElementById('email').value.trim();
          const zoneId = document.getElementById('zone-id').value.trim();
          const apikey = document.getElementById('api-key').value.trim();
          const caSelect = document.getElementById('ca-select').value;

          // 重置错误状态
          resetErrors();

          // 验证输入
          let isValid = true;
          if (!email) {
              showError('email', '请输入有效的邮箱地址');
              isValid = false;
          }
          if (!zoneId) {
              showError('zone-id', '请输入区域ID');
              isValid = false;
          }
          if (!apikey) {
              showError('api-key', '请输入API密钥');
              isValid = false;
          }
          if (!isValid) return;

          // 显示加载状态
          document.getElementById('spinner').style.display = 'block';
          document.getElementById('btn-text').textContent = '添加中...';
          document.getElementById('submit-btn').disabled = true;

          try {
              // 发送请求到 Worker API
              const response = await fetch('/api/add-ssl', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                      email: email,
                      zoneId: zoneId,
                      apikey: apikey,
                      enabled: true,
                      ca: caSelect,
                  }),
              });

              const data = await response.json();

              // 显示结果
              if (data.success) {
                  showResult('证书添加成功, 请10分钟后在Cloudflare该域名里检查SSL/TLS证书', 'success');
              } else {
                  let errorMsg = '添加证书失败';
                  if (data.errors && data.errors.length > 0) {
                      errorMsg += ': ' + (data.errors[0].message || JSON.stringify(data.errors[0]));
                  } else if (data.errors) {
                      errorMsg += ': ' + JSON.stringify(data.errors);
                  }
                  showResult(errorMsg, 'error');
              }
          } catch (error) {
              showResult('请求失败，请检查网络连接', 'error');
              console.error('Error:', error);
          } finally {
              // 隐藏加载状态
              document.getElementById('spinner').style.display = 'none';
              document.getElementById('btn-text').textContent = '添加SSL证书';
              document.getElementById('submit-btn').disabled = false;
          }
      });
  });
  </script>
</body>
</html>`;
}
