## IP6.ARPA域名注册与证书生成

- 自动生成主域名
- 随机生成子域名
- 为域名一键添加证书
- 为子域名一键添加 ns 解析记录
- 自动保存并一键加载主域名配置

## 注册地址

- https://tb.netassist.ua/
- https://dns.he.net/
- https://tunnelbroker.net/

## 部署

CF WORKER 部署，无环境变量

## 生成 IP6.ARPA域名

填入 `/64` 或 `/48` **ipv6 cidr** 地址段，自动生成`根域名`和`三个随机子域名`

## API 调用

### GET 方式 - 添加证书

```
https://worker地址/?zoneId=<CF域名区域ID>&email=<CF用户邮箱>&apikey=<CF全局API KEY>&enabled=true&ca=ssl_com
```

- ca 指证书颁发机构，支持四个：`ssl_com、lets_encrypt、google、sectigo`，默认 `ssl_com`
- enabled 指是否启用新的证书颁发机构，默认 `true`

### POST 方式 - 添加证书

```bash
curl -X POST 'https://[YOUR_WORKER_URL]/api/add-ssl' \
-H 'Content-Type: application/json' \
-d '{
    "email": "your-cloudflare-email@example.com",
    "zoneId": "your-cloudflare-zone-id",
    "apikey": "your-cloudflare-global-api-key",
    "ca": "ssl_com",
    "enabled": true
}'
```

- ca 指证书颁发机构，支持四个：`ssl_com、lets_encrypt、google、sectigo`，默认 `ssl_com`
- enabled 指是否启用新的证书颁发机构，默认 `true`

## POST 方式 - 添加 NS 记录

```bash
curl -X POST 'https://[YOUR_WORKER_URL]/api/add-dns' \
-H 'Content-Type: application/json' \
--data '{
    "zoneId": "5f7409c0dxxxxxxc256c84e57246a593",
    "email": "user@example.com",
    "apikey": "4cc858f6268b4d82d9123f19f47aeafxxxxxx",
    "recordName": "7",
    "nsTargets": [
        "dale.ns.cloudflare.com",
        "desi.ns.cloudflare.com"
    ]
}'
```
