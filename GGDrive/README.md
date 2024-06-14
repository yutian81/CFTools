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
本地安装rclone软件  
使用 rclone 获取 refresh_token   
下载 https://github.com/Aicirou/goindex-theme-acrou/tree/master/go2index 中的 index.js 并替换 client_id 、 client_secret 、 refresh_token 为你刚刚得到的东西。  
将代码部署到 Cloudflare Workers  
