# csub
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
后端使用边缘的API，可以使用自己搭建的后端`csub.yutian81.top`  
