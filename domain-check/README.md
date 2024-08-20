## 项目简介

这是一个简洁高效的域名可视化展示面板，基于Cloudflare Workers构建。它提供了一个直观的界面，让用户能够一目了然地查看他们的域名组合，包括各个域名的状态、注册商、注册日期、过期日期和使用进度。

## 主要特性
**初级版本**

- 清晰展示域名列表及其关键信息：域名状态、注册商、注册日期和过期日期
- 可视化呈现域名使用进度条
- 自动计算并显示域名剩余有效天数
- 响应式设计，完美适配桌面和移动设备
- 轻量级实现，快速加载
- **支持输入自定义域名**

**高级版本**
- 清晰展示域名列表及其关键信息：域名状态、注册商、注册日期、过期日期和**剩余天数**
- 可视化呈现域名使用进度条
- 自动计算并显示域名剩余有效天数
- 响应式设计，完美适配桌面和移动设备
- 轻量级实现，快速加载
- **UI进一步美化，风格统一**
- **前台和后台分离，支持密码保护**
- **通过 Cloudflare API 自动获取域名列表**
- **集成自建 WHOIS 代理服务，自动获取顶级域名信息、二级域名的注册日期**
- **支持手动编辑二级域名信息**
- **支持输入自定义域名**

## 技术实现
- 前端：HTML5, CSS3, JavaScript
- 后端：Cloudflare Workers, KV 存储
- API 集成：Cloudflare API, 自建 WHOIS 代理服务

## 个性化部分
- 可修改 `CUSTOM_TITLE` 变量来自定义面板标题
- 可以绑定自定义域名到 Worker，以提高访问稳定性

# DomainKeeper - 初级版本，只能自定义输入，更灵活，但不高效，适用于少数域名

## 快速部署

   - 登录您的Cloudflare账户
   - 创建新的Worker
   - 将 `index.js` 的内容复制到Worker编辑器，编辑 `DOMAINS` 数组，添加您的域名信息：
   ```javascript
   const DOMAINS = [
     { domain: "example.com", registrationDate: "2022-01-01", expirationDate: "2027-01-01", system: "Cloudflare" },
     // 添加更多域名...
   ];
   ```
   - 保存并部署

## demo
![image](https://github.com/ypq123456789/domainkeeper/assets/114487221/546d0a4c-a74b-436c-a42e-1b013ff6e62b)
https://demo.bacon159.me/

# DomainKeeper - 高级版本，集成cloudflare的域名信息获取和whois查询功能，大大提升了域名管理的效率和便捷性

## 快速部署

1. 登录您的 Cloudflare 账户
2. 创建新的 Worker
3. 将domainkeeper.js脚本内容复制到 Worker 编辑器
4. 在脚本顶部配置以下变量：
   ```javascript
   const CF_API_KEY = "your_cloudflare_api_key";
   const WHOIS_PROXY_URL = "your_whois_proxy_url";
   const ACCESS_PASSWORD = "your_frontend_password";
   const ADMIN_PASSWORD = "your_backend_password";
   ```

**CF_API_KEY的获取方式**： 登录自己的cloudflare账号，打开https://dash.cloudflare.com/profile 点击API令牌，创建令牌，读取所有资源-使用模板，继续以显示摘要，创建令牌，复制此令牌，**保存到记事本，之后不会再显示！**

**WHOIS_PROXY_URL的获取方式**：需要你自建，详见[whois-proxy](https://github.com/ypq123456789/whois-proxy)。**注意，whois-proxy用于本脚本必须绑定域名，不能用IP！假如你的api请求地址是http(s)://你的域名/whois 那么WHOIS_PROXY_URL你只需要填入http(s)://你的域名。**

前台密码按需设置，**后台密码必须设置。**

5. 创建一个 KV 命名空间，命名为`DOMAIN_INFO`，并将其绑定到 Worker，绑定名称为 `DOMAIN_INFO`
![image](https://github.com/ypq123456789/domainkeeper/assets/114487221/6d97b4c4-3cfe-4b1f-9423-000348498f8e)
![image](https://github.com/ypq123456789/domainkeeper/assets/114487221/ff4601b0-5787-4152-ae96-1e79e0e4d817)

6. 保存并部署

## whois-proxy 部署

### 项目描述
这是一个简单的 WHOIS 代理服务器,使用 Node.js 和 Express 框架构建。它提供了一个 API 端点来查询域名的 WHOIS 信息,可以提取并返回关键 WHOIS 信息（创建日期、过期日期、注册商）

### 安装

1. 安装 npm (如果尚未安装):

以下是在不同操作系统上安装Node.js (包含npm) 的命令:

对于 Ubuntu/Debian 系统:

```bash
# 更新包列表
sudo apt update

# 安装Node.js和npm
sudo apt install nodejs npm

# 验证安装
node --version
npm --version
```

对于 CentOS/Fedora 系统:

```bash
# 安装Node.js和npm
sudo dnf install nodejs npm

# 或者如果使用较旧的CentOS版本:
# sudo yum install nodejs npm

# 验证安装
node --version
npm --version
```

对于 macOS (使用Homebrew):

```bash
# 安装Homebrew (如果尚未安装)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装Node.js (会自动包含npm)
brew install node

# 验证安装
node --version
npm --version
```

对于 Windows:

Windows用户通常直接从Node.js官网下载安装程序。但如果您使用包管理器如Chocolatey,可以使用以下命令:

```bash
# 使用Chocolatey安装
choco install nodejs

# 验证安装
node --version
npm --version
```

2. 下载并设置 whois-proxy.js:
   ```
   mkdir -p /root/whois && curl -o /root/whois/whois-proxy.js https://raw.githubusercontent.com/ypq123456789/whois-proxy.js/main/whois-proxy.js && cd /root/whois
   ```
   
3. 安装依赖:
   ```
   npm install express whois node-cache express-rate-limit
   ```

这将安装以下包:
- express: Web 应用框架
- whois: WHOIS 查询功能
- node-cache: 用于实现缓存
- express-rate-limit: 用于实现速率限制


### 使用 PM2 运行服务器

1. 全局安装 PM2:
   ```
   npm install -g pm2
   ```

2. 使用 PM2 启动服务器:
   ```
   pm2 start whois-proxy.js --name "whois-proxy"
   ```

3. 查看运行状态:
   ```
   pm2 status
   ```

4. 查看日志:
   ```
   pm2 logs whois-proxy
   ```

5. 停止服务器:
   ```
   pm2 stop whois-proxy
   ```

6. 重启服务器:
   ```
   pm2 restart whois-proxy
   ```

### API 使用

发送GET请求到 `/whois/:domain` 端点,其中 `:domain` 是您想查询的域名。

例如:
```
http://x.x.x.x/whois/example.com
```
其中x.x.x.x是你vps的ip。

你也可以直接在浏览器中输入这一地址，返回结果就是whois查询结果。
![image](https://github.com/ypq123456789/whois-proxy.js/assets/114487221/762506fd-35ba-4099-aa18-d1d8b5fbbffd)

如果有需要，你也可以绑定自己的域名，并且套上CF的CDN，让自己的服务更加安全。

## 注意事项

- 服务器默认在80端口运行。如需更改,请修改代码中的 `port` 变量。
- 速率限制设置为每个IP每15分钟100个请求。
- WHOIS数据默认缓存1小时。

## demo
![image](https://github.com/ypq123456789/domainkeeper/assets/114487221/0ac1f968-f5f8-498c-888c-af9456a9c6bd)

![image](https://github.com/ypq123456789/domainkeeper/assets/114487221/20ebfa4e-8204-4b11-858f-e8b742b22785)

https://domainkeeper.bacon159.me/ 

前台密码ypq123456

# 支持作者

domainkeeper原项目地址：https://github.com/ypq123456789/domainkeeper  
whois-proxy原项目地址：https://github.com/ypq123456789/whois-proxy
