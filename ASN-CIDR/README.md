# ASN to IPv4CIDRs
原项目地址：https://github.com/cmliu/ASN2IPv4CIDRs  

## 项目描述

该 Worker 脚本旨在处理请求并从请求 asnlookup.com 返回的 HTML 内容中提取基于提供的自治系统号（ASN）的 IPv4 CIDR（无类别域间路由）。

## 安装

创建一个新的worker。然后，你可以把worker.js的代码复制到你的worker的脚本编辑器里。

## 使用

``` arduino
https://your-worker-url.com/ASN_NUMBER
```

要使用worker.js，你只需要访问你的worker的网址，并在地址后面加上你想要查询的ASN号。

例如，如果你的worker的网址是asn2cidr.cmliussss2017.workers.dev

你可以访问https://asn2cidr.cmliussss2017.workers.dev/AS45102

就可以得到AS21859的IPv4的CIDR列表，如下所示：
``` arduino
5.181.224.0/23
8.208.0.0/16
8.209.0.0/19
8.209.36.0/22
...
```

如果你没有提供ASN号，或者提供的ASN号无效，你会收到一个错误信息，如下所示：
``` arduino
Please provide an ASN number
```

## 实际应用方式
``` bash
wget -O ip.txt https://asn2cidr.cmliussss2017.workers.dev/AS45102
```

# 感谢
[asnlookup.com](https://asnlookup.com/)
