addEventListener('fetch',
	event => {
		event.respondWith(handleRequest(event.request));
	});

async function handleRequest(request) {
	const url = new URL(request.url);

	// 从请求路径中提取目标 URL
	let actualUrlStr = url.pathname.replace("/", "");
	actualUrlStr = decodeURIComponent(actualUrlStr);

	if (!actualUrlStr) {
		const mainDomain = url.hostname;
		const websiteTitle = "在线代理服务器"; // 请替换为您的网站标题
		const errorMessage = `
		<!DOCTYPE html>
		<html lang="zh">
		<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta name="apple-mobile-web-app-capable" content="yes">
		<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
		<title>${websiteTitle}</title>
		<link rel="icon" type="image/jpg" href="https://cdn.jsdelivr.net/gh/png-dot/pngpng@main/20231112-014821-y4poc8.jpg">
		<style>
			body {
			font-family: Arial, sans-serif;
			text-align: center;
			background-color: #f0e6fa;
			margin: 0;
			padding: 0;
			display: flex;
			align-items: center;
			justify-content: center;
			height: 100vh;
			}

			#container {
			max-width: 85%;
			width: 100%;
			background-color: #fff;
			padding: 20px;
			border-radius: 10px;
			box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
			box-sizing: border-box;
			}

			h1 {
			margin: 0;
			font-size: 2em;
			color: #333;
			}

			.form-group {
			margin-top: 20px;
			}

			label {
			display: block;
			margin-bottom: 8px;
			font-size: 1.1em;
			color: #333;
			}

			input[type="text"] {
			width: 90%;
			padding: 10px;
			border: 1px solid #ccc;
			border-radius: 5px;
			box-sizing: border-box;
			display: inline-block;
			margin: 10px auto;
			margin-top: 10px;
			margin-bottom: 20px;	
			}

			input[type="button"] {
			background-color: #ff6b81;
			color: #fff;
			border: none;
			padding: 12px;
			border-radius: 5px;
			cursor: pointer;
			transition: background-color 0.3s ease;
			width: 90%;
			font-size: 1.1em;
			}

			input[type="button"]:hover {
			background-color: #ff4757;
			}

			@keyframes shake {
			0% { transform: translateX(0); }
			25% { transform: translateX(-5px); }
			50% { transform: translateX(5px); }
			75% { transform: translateX(-5px); }
			100% { transform: translateX(0); }
			}

			@media (prefers-color-scheme: dark) {
			body {
				background-color: #333;
			}

			#container {
				background-color: #444;
				color: #ddd;
			}

			input[type="text"], input[type="button"] {
				color: #ddd;
			}
			}
		</style>
		</head>
		<body>
		<div id="container">
			<h1>${websiteTitle}</h1>
			<div class="form-group">
			<label for="url">输入需要代理的网站</label>
			<input type="text" id="url" name="url" placeholder="例如：https://github.com/" />
			<input type="button" id="submit" value="进入代理" onclick="redirectToProxy()" />
			</div>
			<p>&copy; 2024 <a href="https://github.com/yutian81/" target="_blank">yutian81</a></p>
		</div>
		<script>
			function redirectToProxy() {
			var urlInput = document.getElementById('url');
			var inputUrl = urlInput.value.trim(); // 移除前后空格
			if (inputUrl) {
				var url = normalizeUrl(inputUrl);
				window.open('https://' + '${mainDomain}' + '/' + url, '_blank');
				urlInput.value = ''; // 清空输入框内容
			} else {
				urlInput.style.animation = 'shake 0.5s';
				setTimeout(() => {
				urlInput.style.animation = ''; // 清除抖动效果
				}, 500);
			}
			}

			function normalizeUrl(inputUrl) {
			if (!inputUrl.startsWith("http://") && !inputUrl.startsWith("https://")) {
				inputUrl = "https://" + inputUrl;
			}
			return inputUrl;
			}

			document.addEventListener('keydown', function(event) {
			if (event.key === 'Enter') {
				document.getElementById('submit').click();
			}
			});
		</script>
		</body>
		</html>
	  `;

		return new Response(errorMessage, {
			status: 400,
			headers: {
				'Content-Type': 'text/html; charset=utf-8'
			}
		});
	}

	// 创建新 Headers 对象，排除以 'cf-' 开头的请求头
	let newHeaders = new Headers();
	for (let pair of request.headers.entries()) {
		if (!pair[0].startsWith('cf-')) {
			newHeaders.append(pair[0], pair[1]);
		}
	}

	// 创建一个新的请求以访问目标 URL
	const modifiedRequest = new Request(actualUrlStr, {
		headers: newHeaders,
		method: request.method,
		body: request.body,
		redirect: 'manual'
	});

	try {
		// 发起对目标 URL 的请求
		const response = await fetch(modifiedRequest);
		let modifiedResponse;
		let body = response.body;

		// 处理重定向
		if ([301, 302, 303, 307, 308].includes(response.status)) {
			const location = new URL(response.headers.get('location'));
			const modifiedLocation = "/" + encodeURIComponent(location.toString());
			modifiedResponse = new Response(response.body, {
				status: response.status,
				statusText: response.statusText
			});
			modifiedResponse.headers.set('Location', modifiedLocation);
		} else {
			if (response.headers.get("Content-Type") && response.headers.get("Content-Type").includes(
					"text/html")) {
				// 如果响应类型是 HTML，则修改响应内容，将相对路径替换为绝对路径
				const originalText = await response.text();
				const regex = new RegExp('((href|src|action)=["\'])/(?!/)', 'g');
				const modifiedText = originalText.replace(regex,
					`$1${url.protocol}//${url.host}/${encodeURIComponent(new URL(actualUrlStr).origin + "/")}`);
				body = modifiedText;
			}

			modifiedResponse = new Response(body, {
				status: response.status,
				statusText: response.statusText,
				headers: response.headers
			});
		}

		// 添加 CORS 头部，允许跨域访问
		modifiedResponse.headers.set('Access-Control-Allow-Origin', '*');
		modifiedResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
		modifiedResponse.headers.set('Access-Control-Allow-Headers', '*');

		return modifiedResponse;
	} catch (error) {
		// 如果请求目标地址时出现错误，返回带有错误消息的响应和状态码 500（服务器错误）
		return new Response('无法访问目标地址: ' + error.message, {
			status: 500
		});
	}
}
