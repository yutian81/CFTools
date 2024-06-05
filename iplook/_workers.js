export default {
  async fetch(request) {
    const body = `
    <!DOCTYPE html>
<html>
<head>
<meta charset='UTF-8'>
<meta name='viewport' content='width=device-width, initial-scale=1'>
<title>我的IP信息</title>
<style>
body { 
  font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; 
  background-color: #F5F5F5; 
  color: #333; 
}
.container { 
  margin: 0 auto; 
  max-width: 800px; 
  padding: 20px; 
}
h1 { 
  text-align: center; 
  font-size: 2em; 
  margin-bottom: 1em; 
}
table { 
  margin: 0 auto; 
  border-collapse: separate; 
  border-spacing: 0; 
  width: 100%; 
  background-color: #fff; 
  border: 1px solid #ddd; 
  border-radius: 10px; 
  overflow: hidden; 
}
table td { 
  border-top: 1px solid #ddd; 
  padding: 12px 15px; 
  text-align: left; 
  border-right: 1px solid #ddd; 
}
table td:last-child { 
  border-right: 0; 
}
@media (max-width: 768px) {
  h1 { 
    font-size: 1.5em; 
  }
  table td { 
    padding: 8px; 
  }
}
</style>
</head>
<body>
<div class="container">
<h1>我的IP信息</h1>
<table>
<tr><td>IP</td><td>${request.headers.get("X-Real-IP")}</td></tr>
<tr><td>城市</td><td>${request.cf.city}</td></tr>
<tr><td>国家/地区</td><td>${request.cf.country}</td></tr>
<tr><td>ASN</td><td>${request.cf.asn}</td></tr>
<tr><td>ASN组织</td><td>${request.cf.asOrganization}</td></tr>
<tr><td>数据中心代码</td><td>${request.cf.colo}</td></tr>
<tr><td>时区</td><td>${request.cf.timezone}</td></tr>
<tr><td>UA</td><td>${request.headers.get("User-Agent")}</td></tr>
</table>
</div>
</body>
</html> 
    `
    const newResponse = new Response(body, {
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    });
    return newResponse;
  },
};
