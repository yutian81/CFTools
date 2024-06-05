# csub
利用CF Worker搭建的反代订阅转换工具（前端），通过随机化服务器地址和节点账号密码，解决用户转换订阅的隐私问题  
`frontend.html`为订阅转换器的前端网页代码，有域名和服务器可以自行搭建  
## 演示网站  
https://psub.888005.xyz  
## 视频教程  
https://youtu.be/X7CC5jrgazo  
- 创建worker，复制代码`_workers.js`，命名为`csub`，保存并部署  
- 创建KV空间，命名为`csub或其他`  
- 设置worker环境变量：`BACKEND`  https://api.v1.mk  
- 给worker绑定KV空间或R2存储桶：变量：`SUB_BUCKET`  csub
- worker地址即为订阅转换器地址，可绑定自定义域名使用
- 最终得到订阅转换器后端地址：`csub.yutian81.top/sub?`，在其他人的转换器前端网页中填入这个地址  
- 也可直接访问 [自己搭建的订阅转换器前端](https://csub.yutian81.top)
## 支持反代转换的协议
- shadowsocks  
- shadowsocksR  
- vmess  
- trojan  
- vless  &ensp;  `取决于后端 `
- hysteria  &ensp;  `取决于后端`  
