// 辅助函数：统一 JSON 响应格式和 CORS 头
function jsonResponse(obj, status = 200) {
    return new Response(JSON.stringify(obj), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PATCH',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
  }
  
  // 辅助函数：统一解析 POST 请求体
  async function parseJsonBody(request, requiredFields) {
    let body;
    try {
        body = await request.json();
    } catch (e) {
        throw new Error('请求体解析失败，请确保是有效的 JSON 格式。');
    }
  
    const missingFields = requiredFields.filter(field => !body[field]);
    if (missingFields.length > 0) {
        throw new Error(`缺少必需的字段: ${missingFields.join(', ')}`);
    }
  
    return body;
  }
  
  // ==========================================================
  
  // 核心函数：处理 SSL 设置更新请求 (/api/add-ssl, GET /?zoneId=...)
  async function handleApiRequest(request, queryParams) {
    let email, zone_id, api_key, enabled, certificate_authority;
  
    try {
        if (request.method === 'POST') {
            const body = await parseJsonBody(request, ['email', 'zoneId', 'apikey']);
            email = body.email;
            zone_id = body.zoneId;
            api_key = body.apikey;
            enabled = body.enabled !== undefined ? body.enabled : true;
            certificate_authority = body.ca || "ssl_com";
        } else if (request.method === 'GET') {
            email = queryParams.get('email');
            zone_id = queryParams.get('zoneId');
            api_key = queryParams.get('apikey');
  
            if (!email || !zone_id || !api_key) {
                throw new Error('邮箱、区域ID和API密钥都是必需的');
            }
            
            enabled = !(queryParams.get('enabled') === 'false');
            certificate_authority = queryParams.get('ca') || "ssl_com";
        }
  
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
        return jsonResponse(result, response.status);
  
    } catch (error) {
        const status = (error.message.includes('必需的') || error.message.includes('JSON')) ? 400 : 500;
        return jsonResponse({ success: false, errors: [{ message: `请求失败: ${error.message}` }] }, status);
    }
  }
  
  // 核心函数：处理 NS 记录添加请求 (/api/add-dns)
  async function handleDnsRequest(request) {
    try {
        // 使用统一的解析函数，NS 目标字段命名为 nsTargets 以符合 JS 风格
        const body = await parseJsonBody(request, ['email', 'zoneId', 'apikey', 'recordName', 'nsTargets']);
        
        const { email, zone_id, api_key, record_name, ns_targets } = {
            email: body.email,
            zone_id: body.zoneId,
            api_key: body.apikey,
            record_name: body.recordName,
            ns_targets: body.nsTargets,
        };
  
        if (!Array.isArray(ns_targets) || ns_targets.length === 0) {
            throw new Error('ns_targets 必须是一个非空的 NS 服务器列表');
        }
  
        const added = [];
        const failed = [];
        const apiUrl = `https://api.cloudflare.com/client/v4/zones/${zone_id}/dns_records`;
  
        for (const ns_target of ns_targets) {
            const trimmedTarget = String(ns_target).trim();
  
            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'X-Auth-Email': email,
                    'X-Auth-Key': api_key,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'NS',
                    name: record_name,
                    content: trimmedTarget,
                    ttl: 300,
                }),
            });
  
            const result = await res.json();
            
            if (result.success) {
                added.push(trimmedTarget);
            } else {
                failed.push({ 
                    ns_target: trimmedTarget, 
                    error: result.errors?.[0]?.message || '未知错误' 
                });
            }
        }
  
        return jsonResponse({ success: failed.length === 0, added, failed });
    } catch (error) {
        const status = (error.message.includes('必需的') || error.message.includes('JSON')) ? 400 : 500;
        return jsonResponse({ success: false, errors: [{ message: `请求失败: ${error.message}` }] }, status);
    }
  }
  
  // ==========================================================
  
  export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;
  
        // 处理 CORS OPTIONS 预检请求
        if (request.method === 'OPTIONS') {
            return jsonResponse({ message: 'CORS Preflight' });
        }
  
        // 1. SSL/TLS 设置 API (GET 或 POST)
        if (
            (path === '/api/add-ssl' && request.method === 'POST') ||
            (path === '/' && request.method === 'GET' && url.searchParams.has('zoneId'))
        ) {
            return handleApiRequest(request, url.searchParams);
        }
  
        // 2. DNS NS 记录添加 API (POST)
        if (path === '/api/add-dns' && request.method === 'POST') {
            return handleDnsRequest(request);
        }
        
        // 3. 默认返回 HTML 页面
        if (path === '/' && request.method === 'GET') {
            return new Response(getHTML(), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
        }
  
        // 4. 其它路径
        return new Response('Not Found', { status: 404 });
    },
  };
  
  // 生成前端 HTML 页面
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
      * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
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
      
      h1 { text-align: center; margin-bottom: 10px; color: white; font-size: 36px; position: relative; padding-bottom: 15px; text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7); }
      h2 { color: #2c3e50; margin-bottom: 10px; font-size: 20px; }
  
      .registration-buttons { display: flex; justify-content: space-between; gap: 15px; margin-bottom: 25px; }
      .register-btn { flex: 1; display: block; background: #0D627E; color: white; text-align: center; text-decoration: none; border-radius: 8px; padding: 10px 15px; font-size: 16px; font-weight: 600; transition: all 0.3s; box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.15); }
      .register-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15); }
  
      .form-group { margin-bottom: 20px; }
      .form-row { display: flex; justify-content: space-between; gap: 20px; margin-top: 15px; }
      .form-group.half-width, .form-group.third-width { flex: 1; margin-bottom: 0; }
      label { display: block; margin-bottom: 8px; font-weight: 600; color: #2c3e50; }
      
      input[type="text"], 
      input[type="email"],
      textarea,
      .ca-select-style {
          width: 100%;
          height: 46px;
          padding: 10px;
          background: rgba(255, 255, 255, 0.35); 
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
          border: 1px solid rgba(255, 255, 255, 0.4); 
          border-radius: 8px;
          font-size: 14px;
          color: #2c3e50;
          transition: all 0.3s;
          box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.15);
          resize: none;
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
       
      .btn {
          background: #0D627E;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 12px 20px;
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
      .btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2); }
      .btn:active { transform: translateY(0); }   
      .btn-group { display: flex; flex-wrap: wrap; gap: 20px; margin-top: 15px; justify-content: space-between; }
      .btn#generate-btn { margin-top: 15px; }
      .btn#generate-btn i, .btn#dns-btn i { position: relative; top: 1px; }
      #generated-domain { height: 106px !important; min-height: 106px; max-height: 106px; padding-top: 10px; }
      #dns-targets, #sub-domain { height: 65px !important; min-height: 65px; max-height: 65px; padding-top: 10px; }
  
      .spinner { display: none; width: 20px; height: 20px; border: 3px solid rgba(255, 255, 255, 0.3); border-radius: 50%; border-top-color: white; animation: spin 1s ease-in-out infinite; margin-right: 10px; }
      @keyframes spin { to { transform: rotate(360deg); } }
      
      .result { margin-top: 20px; padding: 15px; border-radius: 8px; display: none; text-align: center; font-weight: 600; }
      .success { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
      .error-result { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
      .error { border-color: #e74c3c !important; box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.2) !important; }
      .error-message { color: #e74c3c; font-size: 14px; margin-top: 5px; display: none; }
      
      .info-box, .domain-box, #dns-form, #ssl-form {
          background: rgba(255, 255, 255, 0.35);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-left: 4px solid #3498db;
          padding: 15px;
          margin-top: 25px;
          border-radius: 8px;
      }
      .info-box p, .domain-box p, #dns-form p { font-size: 14px; line-height: 1.5; color: #34495e; }
  
      .footer { text-align: center; margin-top: 20px; font-size: 14px; color: #444; }
      .footer a { color: inherit; text-decoration: none; transition: color 0.3s; }
      .footer a:hover { color: #3498db; }
      .separator { padding: 0 5px; color: inherit; display: inline-block; }
  
      /* 响应式调整：在小屏幕上变回单列布局 */
      @media (max-width: 600px) {
        .form-row { flex-direction: column; gap: 0; }
        .form-group.half-width, .form-group.third-width { margin-bottom: 15px; }
        .footer { font-size: 0.8em; }
        .btn-group { flex-direction: column; gap: 0; margin-top: 0; }
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
  
      <div class="domain-box">
        <h2>IP6.ARPA 域名生成工具</h2>
        <div class="form-row">
          <div class="form-group half-width">
            <label for="ipv6-cidr"><i class="fas fa-network-wired"></i> 输入 IPv6 CIDR 地址</label>
            <input type="text" id="ipv6-cidr" placeholder="请输入 IPv6 CIDR, 例如: 2001:DB8::/48">
            <div class="error-message" id="ipv6-cidr-error">请输入有效的 IPv6 CIDR</div>
            <button type="submit" class="btn" id="generate-btn">
                <div class="spinner" id="generate-spinner"></div>
                <span id="generate-text"><i class="fas fa-sync-alt"></i>&nbsp;生成 IP6.ARPA 域名
            </button>
          </div>
          <div class="form-group half-width">
            <label for="generated-domain"><i class="fas fa-check-circle"></i> IP6.ARPA 域名生成结果</label>
            <textarea id="generated-domain" readonly rows="4" placeholder="生成结果将显示在这里"></textarea> 
          </div>
        </div>
        <p style="margin: 10px 0 6px 0;">🚀 获取域名后，选择一个域名托管到 CF，并获取域名的 NS 名称服务器</p>
        <p>🚀 将托管的域名复制到下方的<strong>“完整子域名”</strong>输入框，将对应的 NS 服务器复制到下方的<strong>“子域名 NS 名称服务器”</strong>输入框</p>
      </div>
  
      <div class="result" id="result-message"></div>
      
      <form id="ssl-form">
        <h2>SSL 证书生成与 NS 授权工具</h2>
        
        <div class="form-row">
            <div class="form-group half-width">
                <label for="email"><i class="fas fa-envelope"></i> Cloudflare注册邮箱</label>
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
                <label for="api-key"><i class="fas fa-key"></i> 全局API密钥</label>
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

        <div class="form-row">
            <div class="form-group half-width">
                <label for="sub-domain"><i class="fas fa-layer-group"></i> 完整域名 (从上方结果复制)</label>
                <input type="text" id="sub-domain" placeholder="例如: 0.8.d.2.e.2.9.1.8.3.2.b.2.ip6.arpa">
                <div class="error-message" id="sub-domain-error">请输入完整的域名</div>
            </div>
            
            <div class="form-group half-width">
                <label for="dns-targets"><i class="fas fa-server"></i> 子域名 NS 名称服务器</label>
                <textarea id="dns-targets" rows="2" placeholder="输入至少2个NS服务器, 每行1个"></textarea>
                <div class="error-message" id="dns-targets-error">输入至少2个NS服务器, 每行1个</div>
            </div>
        </div>

        <div class="btn-group">
            <div class="form-group third-width">
                <button type="submit" class="btn" id="ssl-btn">
                    <div class="spinner" id="ssl-spinner"></div>
                    <span id="ssl-text"><i class="fas fa-plus-circle"></i> 添加 SSL 证书</span>
                </button>
            </div>

            <div class="form-group third-width">
                <button type="submit" class="btn" id="dns-btn">
                    <div class="spinner" id="dns-spinner"></div> 
                    <span id="dns-text"><i class="fas fa-plus-circle"></i>&nbsp;添加子域 NS 记录</span>
                </button>
            </div>
            
            <div class="form-group third-width">
                <button type="button" class="btn" id="history-btn">
                    <div class="spinner" id="history-spinner"></div> 
                    <span id="history-text"><i class="fas fa-history"></i>&nbsp;获取最近一次历史配置</span>
                </button>
            </div>
        </div>
      </form>

      <div class="info-box">
        <h2>API GET 调用示例</h2>
        <p style="font-size: 16px; margin-bottom: 10px;"><i class="fas fa-database"></i> <strong>GET 请求 - 添加 SSL 证书</strong></p>
        <pre style="background: rgba(255, 255, 255, 0.3); padding: 10px; border-radius: 6px; font-size: 14px; overflow-x: auto; color: #000; box-shadow: 8px 8px 15px rgba(0, 0, 0, 0.15);">https://[worker-url]/?zoneId=...&email=...&apikey=...&enabled=true&ca=ssl_com</pre>
        <p style="margin: 10px 0 6px 0;">🚀 证书颁发机构 (ca) 支持：<code>ssl_com</code>、<code>lets_encrypt</code>、<code>google</code>、<code>sectigo</code>。<strong>注意：ip6.arpa 域名通常仅支持 <code>ssl_com</code>。</strong></p>
        <p>🚀 POST 请求示例详见仓库 README.md 说明文件</p>
      </div>
  
      <div class="footer">
        <i class="fas fa-copyright"></i> Copyright 2025 <span class="separator">|</span>
        <a href="https://github.com/yutian81/CFTools/tree/main/ipv6-arpa-ssl" target="_blank"><i class="fab fa-github"></i> GitHub</a> <span class="separator">|</span>
        <a href="https://blog.811520.xyz/" target="_blank"><i class="fas fa-blog"></i> QingYun Blog</a>
      </div>
    </div>
  
<script>
    // ==========================================================
    // 域名生成逻辑 (保持不变)
    // ==========================================================
  
    // 辅助函数：将缩写的 IPv6 地址展开为完整的 32 位十六进制字符串
    function expandIpv6(ipv6) {
        ipv6 = ipv6.toLowerCase();
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
        const fullHex = expandIpv6(ipv6);
        const hexCharsInPrefix = prefixLength / 4;
        const networkPrefix = fullHex.substring(0, hexCharsInPrefix);
        const reversed = networkPrefix.split('').reverse().join('.');
        return reversed + '.ip6.arpa';
    }
  
    // 生成随机前缀域名
    function generateRandomPrefixDomains(baseArpaDomain) {
        const domains = [baseArpaDomain];
        for (let i = 0; i < 3; i++) {
            const randomLength = Math.floor(Math.random() * 4) + 1;
            const prefix = randomHex(randomLength).split('').join('.');
            domains.push(prefix + '.' + baseArpaDomain); 
        }
        return domains;
    }
  
    // ==========================================================
    // DOM 交互逻辑
    // ==========================================================
  
    const STORAGE_FIELDS = [
      'ipv6-cidr', 'email', 'zone-id', 'api-key', 'sub-domain', 'dns-targets' 
    ];
    
    // 辅助函数：保存表单字段到本地存储
    function saveFormField(id, value) {
        localStorage.setItem(id, value);
    }
    
    // 从本地存储加载表单字段
    function loadFormFields() {
        STORAGE_FIELDS.forEach(id => {
            const savedValue = localStorage.getItem(id);
            const element = document.getElementById(id);
            if (savedValue && element) {
                element.value = savedValue;
            }
        });
    }
  
    // 辅助函数：为所有目标字段添加输入事件监听器，实现实时保存
    function initializeStorageListeners() {
        STORAGE_FIELDS.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', function (e) {
                    saveFormField(id, e.target.value.trim());
                });
            }
        });
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
    
    // 关键辅助函数：从子域名中提取相对于主区域的前缀
    function extractSubdomainPrefix(fullSubdomain, cidr) {
        try {
            const rootDomain = generateArpaRootDomain(cidr);
            
            // 检查子域名是否以主域名结尾
            if (fullSubdomain === rootDomain) {
                return '@'; // 根域名本身用 @ 表示
            }
            if (fullSubdomain.endsWith('.' + rootDomain)) {
                // 截取掉主域名和它前面的点
                const prefix = fullSubdomain.substring(0, fullSubdomain.length - rootDomain.length - 1);
                return prefix;
            }
            // 如果不是基于当前 CIDR 的子域名，则无法正确解析
            throw new Error('子域名格式不匹配当前 CIDR 的主域名');
            
        } catch (e) {
            console.error('Prefix extraction failed:', e);
            throw new Error('无法自动解析子域前缀，请检查完整子域名和 CIDR 是否匹配。');
        }
    }
  
    // ==========================================================
    // 页面初始化和事件监听
    // ==========================================================
    document.addEventListener('DOMContentLoaded', function () {
        // loadFormFields();
        initializeStorageListeners();
        
        const emailInput = document.getElementById('email');
        const zoneIdInput = document.getElementById('zone-id');
        const apikeyInput = document.getElementById('api-key');
        
        // 事件监听: IPv6 域名生成
        document.getElementById('generate-btn').addEventListener('click', async function () {
            resetErrors();
            const cidrInput = document.getElementById('ipv6-cidr');
            const domainOutput = document.getElementById('generated-domain');
            const cidr = cidrInput.value.trim();
            domainOutput.value = '';
            
            // 存储 CIDR
            saveFormField('ipv6-cidr', cidr);
  
            if (!cidr) {
                showError('ipv6-cidr', '请输入 IPv6 CIDR 地址。');
                return;
            }
  
            try {
                const rootDomain = generateArpaRootDomain(cidr);
                // 确保主域名也被保存，以便 NS 解析时使用
                localStorage.setItem('root-arpa-domain', rootDomain); 
                
                const generatedDomains = generateRandomPrefixDomains(rootDomain);
                const resultText = generatedDomains.join('\\n');
                domainOutput.value = resultText;
                const copySuccess = await copyTextToClipboard(resultText);
  
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
  
        // 事件监听: Cloudflare SSL 提交
        document.getElementById('ssl-btn').addEventListener('click', async function (e) {
            e.preventDefault();
            
            // 获取统一的输入值
            const email = emailInput.value.trim();
            const zoneId = zoneIdInput.value.trim();
            const apikey = apikeyInput.value.trim();
            const caSelect = document.getElementById('ca-select').value;
            const submitBtn = document.getElementById('ssl-btn'); 
  
            resetErrors();
  
            let isValid = true;
            if (!email) { showError('email', '请输入有效的邮箱地址'); isValid = false; }
            if (!zoneId) { showError('zone-id', '请输入区域ID'); isValid = false; }
            if (!apikey) { showError('api-key', '请输入API密钥'); isValid = false; }
            if (!isValid) return;
  
            const spinner = document.getElementById('ssl-spinner');
            document.getElementById('ssl-text').textContent = '添加中...';
            spinner.style.display = 'block';
            submitBtn.disabled = true;
  
            try {
                const response = await fetch('/api/add-ssl', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, zoneId, apikey, enabled: true, ca: caSelect }),
                });
  
                const data = await response.json();
  
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
                spinner.style.display = 'none';
                document.getElementById('ssl-text').innerHTML = '<i class="fas fa-plus-circle"></i>&nbsp;添加 SSL 证书';
                submitBtn.disabled = false;
            }
        });
  
        // 事件监听: NS 解析提交
        document.getElementById('dns-btn').addEventListener('click', async function (e) {
            e.preventDefault();
            
            // 身份信息和域名信息
            const email = emailInput.value.trim();
            const zoneId = zoneIdInput.value.trim();
            const apikey = apikeyInput.value.trim();          
            const cidr = document.getElementById('ipv6-cidr').value.trim();
            const fullSubdomain = document.getElementById('sub-domain').value.trim();
            const targetsText = document.getElementById('dns-targets').value.trim();
            const submitBtn = document.getElementById('dns-btn');          
            const nsTargets = targetsText.split('\\n')
                                         .map(line => line.trim())
                                         .filter(line => line.length > 0);
  
            resetErrors();
            
            // 验证身份信息
            let isValid = true;
            if (!email) { showError('email', '请输入有效的邮箱地址'); isValid = false; }
            if (!zoneId) { showError('zone-id', '请输入区域ID'); isValid = false; }
            if (!apikey) { showError('api-key', '请输入API密钥'); isValid = false; }
            
            // 验证 NS 委托信息
            if (!cidr) { showError('ipv6-cidr', '请先输入 IPv6 CIDR 地址'); isValid = false; }
            if (!fullSubdomain) { showError('sub-domain', '请输入完整的域名'); isValid = false; }
            if (nsTargets.length < 2) { 
                showError('dns-targets', '请输入至少2个NS名称服务器，每行1个'); 
                isValid = false; 
            }
            if (!isValid) return;
            
            let recordName = '';
            try {
                // 自动提取 recordName
                recordName = extractSubdomainPrefix(fullSubdomain, cidr);
                if (!recordName) {
                     showError('sub-domain', '无法解析子域前缀，请检查输入或 CIDR');
                     return;
                }
            } catch (error) {
                showError('sub-domain', error.message);
                return;
            }
  
            // 显示加载状态
            const spinner = document.getElementById('dns-spinner');
            document.getElementById('dns-text').textContent = '添加中...';
            spinner.style.display = 'block';
            submitBtn.disabled = true;
  
            try {
                // 发送请求到 Worker API (/api/add-dns)
                const response = await fetch('/api/add-dns', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: email,
                        zoneId: zoneId,
                        apikey: apikey,
                        recordName: recordName, // 使用提取出的前缀
                        nsTargets: nsTargets,
                    }),
                });
  
                const data = await response.json();
  
                if (data.success) {
                    let successMsg = \`成功添加 \${data.added.length} 条 NS 记录。子域前缀: \${recordName}\`;
                    if (data.failed && data.failed.length > 0) {
                        successMsg += \` 但有 \${data.failed.length} 条记录添加失败。\`;
                    }
                    showResult(successMsg, 'success');
                } else {
                    let errorMsg = 'NS记录添加失败';
                    if (data.errors && data.errors.length > 0) {
                        errorMsg += ': ' + (data.errors[0].message || JSON.stringify(data.errors[0]));
                    } else if (data.failed && data.failed.length > 0) {
                        errorMsg += ': 至少一条记录失败。' + data.failed[0].ns_target + ' 错误: ' + data.failed[0].error;
                    } else {
                        errorMsg += ': ' + JSON.stringify(data);
                    }
                    showResult(errorMsg, 'error');
                }
            } catch (error) {
                showResult('请求失败，请检查网络连接', 'error');
                console.error('DNS Add Error:', error);
            } finally {
                spinner.style.display = 'none';
                document.getElementById('dns-text').innerHTML = '<i class="fas fa-plus-circle"></i>&nbsp;添加子域 NS 记录';
                submitBtn.disabled = false;
            }
        });
        
        // 事件监听: 加载历史配置
        document.getElementById('history-btn').addEventListener('click', function() {
            resetErrors();
            const submitBtn = document.getElementById('history-btn');
            const spinner = document.getElementById('history-spinner');
            
            // 设置加载状态
            document.getElementById('history-text').textContent = '获取中...';
            spinner.style.display = 'block';
            submitBtn.disabled = true;

            // 模拟加载过程（因为它只是从本地存储读取）
            setTimeout(() => {
                loadFormFields(); // 调用已有的加载函数
                showResult('已加载最近一次保存的配置。', 'success');
                // 恢复按钮状态
                spinner.style.display = 'none';
                document.getElementById('history-text').innerHTML = '<i class="fas fa-history"></i>&nbsp;获取最近一次历史配置';
                submitBtn.disabled = false;
            }, 300); // 增加一个短延迟，让用户看到加载状态
        });
    });
    </script>
  </body>
  </html>`;
}
