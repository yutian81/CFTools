# 节点转换器
利用CF Worker搭建的反代订阅转换工具（前端），通过随机化服务器地址和节点账号密码，解决用户转换订阅的隐私问题  
`frontend.html`为订阅转换器的前端网页代码，有域名和服务器可以自行搭建  

## 演示网站  
https://psub.888005.xyz  

## 视频教程  
https://youtu.be/X7CC5jrgazo  
- 创建worker，复制代码`_workers.js`，命名为`csub`，保存并部署  
- 创建KV空间，命名为`csub或其他`  
- 设置worker环境变量：`BACKEND`  https://sub.v1.mk  
- 给worker绑定KV空间或R2存储桶：变量：`SUB_BUCKET`  csub
- worker地址即为订阅转换器地址，可绑定自定义域名使用
- 最终得到订阅转换器后端地址：`https://csub.yutian81.top/sub?`，在其他人的转换器前端网页中填入这个地址  
- 也可直接访问 [自己搭建的订阅转换器前端](https://csub.yutian81.top)
- CMliu的转换器后端：subapi.fxxk.dedyn.io

## 支持反代转换的协议
- shadowsocks  
- shadowsocksR  
- vmess  
- trojan  
- vless  &ensp;  `取决于后端 `
- hysteria  &ensp;  `取决于后端`  

## 文件说明
`_workers.js`：可自建后端  
`_workers2.js`：使用第三方后端  

### `_workers2.js`的使用
将程序导入worker，配置好你机场的订阅链接，访问worker的时候url后面带上参数，即可生成不同工具的配置  
如生成clash的配置，访问`https://xxx.xxx.workers.dev/clash`  

## 大佬前后端搜集
- [**不良林的搭建教程**](https://github.com/bulianglin/psub)
- ~~自建示例前端 <https://csub.yutian81.top>；后端：`csub.yutian81.top`~~
- 不良林转换器前端：<https://psub.888005.xyz>；后端：`psub.888005.xyz`
- 肥羊转换器前端：<https://sub.v1.mk>；后端：`url.v1.mk`
- 边缘转换器前端：<https://bianyuan.xyz/>；后端：`pub-api-1.bianyuan.xyz`
- A4转换器前端：<https://acl4ssr-sub.github.io>
- 其他大佬的后端
  - 品云：`sub.id9.cc`
  - subconvert：`sub.xeton.dev`
  - lhie1：`api.dler.io`
  - 猫熊：`sub.maoxiongnet.com`
  - CM：`fxxk.dedyn.io`
- v2rayse转换工具：通过 <https://v1.v2rayse.com/> 中的`节点转换工具`，将v2ray节点和clash节点互转，并可自动备份到github，自动生成订阅链接
- 本地转换工具
  - 不良林教程：https://bulianglin.com/archives/51.html  
  - 需要先下载[本地转换工具](https://github.com/tindy2013/subconverter/releases)  

## 订阅转换器配置文件：
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
