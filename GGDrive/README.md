# goindex
Google Drive Directory Index

## 功能：
部署在 CloudFlare Workers的小程序。  
可以将 Google Drive 文件以目录形式列出，并直连下载。  
流量走 CloudFlare ，网速由 CloudFlare 决定。

## Demo
[https://index.gd.workers.dev/](https://index.gd.workers.dev/)  

## 安装运行

1、访问[https://install.gd.workers.dev/](https://install.gd.workers.dev/)  
2、授权认证后，生成部署代码。  
3、复制代码 到 CloudFlare 部署。  

## 手动部署
打开 Google 云端硬盘 API  
创建 OAuth 客户端 ID  
本地安装rclone软件，使用 rclone 获取 refresh_token   
  - 按照https://rclone.org/drive/绑定驱动器
  - 执行命令 rclone config file 查找文件 rclone.conf 路径
  - 打开 rclone.conf ，找到配置 root_folder_id 和 refresh_token
  - 在https://github.com/donwa/goindex下载index.js并填写root和refresh_token  
在https://github.com/donwa/goindex下载index.js并填写`client_id`、`client_secret`、`refresh_token`     
将代码部署到 Cloudflare Workers  

## 修改版
`index2.js`：在 原版`goindex`基础上添加了多盘支持、搜索、分页加载等功能
