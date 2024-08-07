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

## demo
![image](https://github.com/ypq123456789/domainkeeper/assets/114487221/0ac1f968-f5f8-498c-888c-af9456a9c6bd)

![image](https://github.com/ypq123456789/domainkeeper/assets/114487221/20ebfa4e-8204-4b11-858f-e8b742b22785)

https://domainkeeper.bacon159.me/ 

前台密码ypq123456

# 其他
## 贡献指南

欢迎通过Issue和Pull Request参与项目改进。如有重大变更，请先提Issue讨论。

## 开源协议

本项目采用 [MIT 许可证](https://choosealicense.com/licenses/mit/)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=ypq123456789/domainkeeper&type=Date)](https://star-history.com/#ypq123456789/domainkeeper&Date)

## 交流TG群：
https://t.me/+ydvXl1_OBBBiZWM1

## 支持作者

<span><small>非常感谢您对 domainkeeper 项目的兴趣！维护开源项目确实需要大量时间和精力投入。若您认为这个项目为您带来了价值，希望您能考虑给予一些支持，哪怕只是一杯咖啡的费用。
您的慷慨相助将激励我继续完善这个项目，使其更加实用。它还能让我更专心地参与开源社区的工作。如果您愿意提供赞助，可通过下列渠道：</small></span>

- 给该项目点赞 [![给该项目点赞](https://img.shields.io/github/stars/ypq123456789/domainkeeper?style=social)](https://github.com/ypq123456789/domainkeeper)
- 关注我的 Github [![关注我的 Github](https://img.shields.io/github/followers/ypq123456789?style=social)](https://github.com/ypq123456789)

| 微信 | 支付宝 |
|------|--------|
| ![微信](https://github.com/ypq123456789/TrafficCop/assets/114487221/fb265eef-e624-4429-b14a-afdf5b2ca9c4) | ![支付宝](https://github.com/ypq123456789/TrafficCop/assets/114487221/884b58bd-d76f-4e8f-99f4-cac4b9e97168) |

