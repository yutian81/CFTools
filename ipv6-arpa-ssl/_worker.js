
export default {
    async fetch(request, env, ctx) {
      const url = new URL(request.url);
      
      // 处理 API 请求
      if (url.pathname === '/api/add-ssl' && request.method === 'POST') {
        return handleApiRequest(request);
      }
      
      // 返回 HTML 页面
      return new Response(getHTML(), {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    },
  };
  
  async function handleApiRequest(request) {
    try {
      const { email, zone_id, api_key } = await request.json();
      
      // 验证输入
      if (!email || !zone_id || !api_key) {
        return new Response(JSON.stringify({
          success: false,
          errors: ['所有字段都是必需的']
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // 调用 Cloudflare API
      const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zone_id}/ssl/universal/settings`, {
        method: 'PATCH',
        headers: {
          'X-Auth-Email': email,
          'X-Auth-Key': api_key,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enabled: true,
          certificate_authority: "ssl_com"
        }),
      });
      
      const result = await response.json();
      
      return new Response(JSON.stringify(result), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
      
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        errors: [`请求失败: ${error.message}`]
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }
  }
  
  function getHTML() {
    return `<!DOCTYPE html>
  <html lang="zh-CN">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>IP6.ARPA域名自动添加SSL证书</title>
      <style>
          * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          }
          
          body {
              background: linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d);
              color: #333;
              min-height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
              padding: 10px;
          }
          
          .container {
              background-color: rgba(255, 255, 255, 0.95);
              border-radius: 12px;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
              width: 100%;
              max-width: 500px;
              padding: 30px;
          }
          
          h1 {
              text-align: center;
              margin-bottom: 25px;
              color: #2c3e50;
              font-size: 24px;
              position: relative;
              padding-bottom: 15px;
          }
          
          h1:after {
              content: '';
              position: absolute;
              bottom: 0;
              left: 25%;
              width: 50%;
              height: 3px;
              background: linear-gradient(to right, #1a2a6c, #b21f1f, #fdbb2d);
              border-radius: 3px;
          }
          
          .register-btn {
              display: block;
              background: linear-gradient(to right, #1a2a6c, #3498db);
              color: white;
              text-align: center;
              text-decoration: none;
              border-radius: 8px;
              padding: 14px 20px;
              font-size: 16px;
              font-weight: 600;
              margin-bottom: 25px;
              transition: all 0.3s;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
          
          input[type="text"], input[type="email"] {
              width: 100%;
              padding: 12px 15px;
              border: 2px solid #e0e0e0;
              border-radius: 8px;
              font-size: 16px;
              transition: all 0.3s;
          }
          
          input[type="text"]:focus, input[type="email"]:focus {
              border-color: #3498db;
              box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
              outline: none;
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
              background: linear-gradient(to right, #1a2a6c, #b21f1f);
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
          }
          
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
              background-color: #e8f4fd;
              border-left: 4px solid #3498db;
              padding: 15px;
              margin-top: 25px;
              border-radius: 0 8px 8px 0;
          }
          
          .info-box h3 {
              color: #2c3e50;
              margin-bottom: 10px;
              font-size: 16px;
          }
          
          .info-box p {
              font-size: 14px;
              line-height: 1.5;
              color: #34495e;
          }
          
          .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #7f8c8d;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <h1>IP6.ARPA域名自动添加SSL证书</h1>
          
          <a href="https://tb.netassist.ua" class="register-btn" target="_blank">注册ip6.arpa域名</a>
          
          <form id="ssl-form">
              <div class="form-group">
                  <label for="email">Cloudflare注册邮箱 (Email)</label>
                  <input type="email" id="email" placeholder="请输入您的Cloudflare邮箱">
                  <div class="error-message" id="email-error">请输入有效的邮箱地址</div>
              </div>
              
              <div class="form-group">
                  <label for="zone-id">区域ID (Zone ID)</label>
                  <input type="text" id="zone-id" placeholder="请输入您的区域ID">
                  <div class="error-message" id="zone-id-error">请输入区域ID</div>
              </div>
              
              <div class="form-group">
                  <label for="api-key">全局API密钥 (API Key)</label>
                  <input type="text" id="api-key" placeholder="请输入您的API密钥">
                  <div class="error-message" id="api-key-error">请输入API密钥</div>
              </div>
              
              <button type="submit" class="btn" id="submit-btn">
                  <div class="spinner" id="spinner"></div>
                  <span id="btn-text">添加SSL证书</span>
              </button>
          </form>
          
          <div class="result" id="result-message"></div>
          
          <div class="info-box">
              <h3>使用说明</h3>
              <p>1. 请确保您输入的Cloudflare账户信息正确</p>
              <p>2. 请确保您的ip6.arpa域名已在cloudflare激活状态再添加</p>
              <p>3. 添加成功后，请等待10分钟，然后在域名菜单检查SSL/TLS证书</p>
              <p>4. 此工具使用Cloudflare API为您的IP6.ARPA域名添加SSL证书</p>
          </div>
          
          <div class="footer">
              <p>注意：您的API密钥仅用于本次请求，不会被存储</p>
          </div>
      </div>
  
      <script>
          document.getElementById('ssl-form').addEventListener('submit', async function(e) {
              e.preventDefault();
              
              // 获取输入值
              const email = document.getElementById('email').value.trim();
              const zoneId = document.getElementById('zone-id').value.trim();
              const apiKey = document.getElementById('api-key').value.trim();
              
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
              
              if (!apiKey) {
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
                          zone_id: zoneId,
                          api_key: apiKey
                      })
                  });
                  
                  const data = await response.json();
                  
                  // 显示结果
                  if (data.success) {
                      showResult('证书添加成功，请10分钟后在Cloudflare该域名里检查SSL/TLS证书', 'success');
                  } else {
                      let errorMsg = '添加证书失败';
                      if (data.errors && data.errors.length > 0) {
                          errorMsg += ': ' + data.errors[0].message;
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
          
          function showError(fieldId, message) {
              const field = document.getElementById(fieldId);
              const errorElement = document.getElementById(\`\${fieldId}-error\`);
              
              field.classList.add('error');
              errorElement.textContent = message;
              errorElement.style.display = 'block';
              
              // 聚焦到第一个错误字段
              if (!document.querySelector('.error:focus')) {
                  field.focus();
              }
          }
          
          function resetErrors() {
              const errorFields = document.querySelectorAll('.error');
              const errorMessages = document.querySelectorAll('.error-message');
              
              errorFields.forEach(field => {
                  field.classList.remove('error');
              });
              
              errorMessages.forEach(message => {
                  message.style.display = 'none';
              });
          }
          
          function showResult(message, type) {
              const resultElement = document.getElementById('result-message');
              resultElement.textContent = message;
              resultElement.className = 'result';
              resultElement.classList.add(type === 'success' ? 'success' : 'error-result');
              resultElement.style.display = 'block';
              
              // 滚动到结果
              resultElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
      </script>
  </body>
  </html>`;
  }
