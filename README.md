# CFTools
通过**Cloudflare**的`workers`或`pages`搭建一些实用工具的脚本

## 文件说明
###  `speedtest`文件夹：测速地址搭建
- 自建测速链接地址示例：`https://cesu.yutian81.top/100m`，默认为200M
- mingyu大佬提供测速地址：`https://spurl.api.030101.xyz/100mb`。[参数说明](https://spurl.api.030101.xyz/)
- nekobox官方测速地址：`http://cachefly.cachefly.net/100mb.test`
- 测速地址用于`CloudflareSpeedTest`工具，[项目地址](https://github.com/XIU2/CloudflareSpeedTest)

###  `iplook`文件夹：显示本机外网IP地区和运营商
- 示例：<https://ip.yutian81.top/>

### `GPT-RPoroxy`文件夹：在CF中反向代理自行部署的chatgpt
- 脚本来自CMLiu大佬；自行部署chatgpt[项目地址](https://github.com/ChatGPTNextWeb/ChatGPT-Next-Web)

### `CFcdn-proxy`文件夹：将任意域名通过CF进行反代

### `sub-convert`文件夹：节点转换器搭建
- 示例：<https://csub.yutian81.top>

### `shortlink`文件夹：生成短链接的
- 示例：<https://slink.yutian81.top/duanlian>

### `GithubRaw`文件夹：从Github私有库获取直链地址
- 在直链前加前缀`https://github.yutian81.top/`

## 节点转换器
- [**不良林的搭建教程**](https://github.com/bulianglin/psub)
- **自建示例前端：** <https://csub.yutian81.top>；后端：`csub.yutian81.top`
- 不良林转换器前端：<https://psub.888005.xyz>；后端：`psub.888005.xyz`
- 肥羊转换器前端：<https://sub.v1.mk>；后端：`url.v1.mk`
- 边缘转换器前端：<https://bianyuan.xyz/>；后端：`pub-api-1.bianyuan.xyz`
- A4转换器前端：<https://acl4ssr-sub.github.io>
- 其他大佬的后端
  - 品云：`sub.id9.cc`
  - subconvert：`sub.xeton.dev`
  - lhie1：`api.dler.io`
  - 猫熊：`sub.maoxiongnet.com`
  - CM：`subapi.fxxk.dedyn.io`
- v2rayse转换工具：通过 <https://v2rayse.com/> 中的`节点转换工具`，将v2ray节点和clash节点互转，并可自动备份到github，自动生成订阅链接
- 本地转换工具
  - 不良林教程：https://bulianglin.com/archives/51.html  
  - 需要先下载[本地转换工具](https://github.com/tindy2013/subconverter/releases)  

## 订阅转换器配置文件（来自A4大佬）：
- A4带负载均衡完整版，[项目地址](https://github.com/ACL4SSR/ACL4SSR/tree/master/Clash/config)
```ini
https://ghproxy.net/https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full_MultiMode.ini
```
- A4带负载均衡精简版，[项目地址](https://github.com/ACL4SSR/ACL4SSR/tree/master/Clash/config)
```ini
https://ghproxy.net/https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Mini_MultiMode.ini
```
- CM负载均衡不带warp分流完整版，[项目地址](https://github.com/cmliu/ACL4SSR/tree/main/Clash/config)
```
https://ghproxy.net/https://raw.githubusercontent.com/cmliu/ACL4SSR/main/Clash/config/ACL4SSR_Online_Full_MultiMode.ini
```
- CM负载均衡带warp分流完整版，[项目地址](https://github.com/cmliu/ACL4SSR/tree/main/Clash/config)
```
https://ghproxy.net/https://raw.githubusercontent.com/cmliu/ACL4SSR/main/Clash/config/ACL4SSR_Online_Full_MultiMode_WARP.ini
```

## 两个一周免费节点申请网站  
- <https://howdy.id/xray-vmess-vless-trojan>  
- <https://www.fastssh.com/page/v2ray-servers>  
