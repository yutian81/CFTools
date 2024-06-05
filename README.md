# CFTools
通过**Cloudflare**的`workers`或`pages`搭建一些实用工具的脚本

## 文件说明
- `speedtest`文件夹：测速地址搭建脚本
  - 自建测速链接地址：示例：`https://cesu.yutian81.top/100m`，默认为200M
  - mingyu大佬提供测速地址：`https://spurl.api.030101.xyz/100mb`。[参数说明](https://spurl.api.030101.xyz/)
  - 测速地址用于`CloudflareSpeedTest`工具，[项目地址](https://github.com/XIU2/CloudflareSpeedTest)  
- `iplook`文件夹：显示本机外网IP地区和运营商的搭建脚本，示例：<https://ip.yutian81.top/>
- `GPT-RPoroxy`文件夹：在CF中反向代理自行部署chatgpt的脚本
  - 脚本来自CMLiu大佬；自行部署chatgpt[项目地址](https://github.com/ChatGPTNextWeb/ChatGPT-Next-Web)
- `CFcdn-proxy`文件夹：将任意域名通过CF进行反代
- `sub-convert`文件夹：节点转换器搭建脚本，示例：<https://csub.yutian81.top>
- `shortlink`文件夹：生成短链接的脚本，示例：<https://slink.yutian81.top/duanlian>
- `GithubRaw`文件夹：从私有库获取直链Github地址

## 节点转换器搭建
- 不良林节点转换器前端：<https://psub.888005.xyz>，[不良林教程](https://github.com/bulianglin/psub)
- 大佬的订阅转换器后端：肥羊 `sub.v1.mk`
- 自建节点转换器前端：<https://csub.yutian81.top>；后端：`csub.yutian81.top?sub`
- 订阅转换器配置文件（来自A4大佬）：
  - 带负载均衡完整版
  ```ini
  https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full_MultiMode.ini
  ```
  - 带负载均衡精简版
  ```ini
  https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Mini_MultiMode.ini
  ```
  - 支持warp节点分流
  ```ini
  https://raw.githubusercontent.com/cmliu/ACL4SSR/main/Clash/config/ACL4SSR_Online_Full_MultiMode_WARP.ini
    ```

## 其他节点转换工具
### 在线转换
- 通过 <https://v2rayse.com/> 中的`节点转换工具`，将v2ray节点和clash节点互转，并可自动备份到github，自动生成订阅链接  
- A4大佬：<https://acl4ssr-sub.github.io>  
- 肥羊大佬：<https://sub.v1.mk>  
### 本地转换 
- 不良林：https://bulianglin.com/archives/51.html  
- 需要先下载[本地转换工具](https://github.com/tindy2013/subconverter/releases)  

## 两个一周免费节点申请网站  
- <https://howdy.id/xray-vmess-vless-trojan>  
- <https://www.fastssh.com/page/v2ray-servers>  
