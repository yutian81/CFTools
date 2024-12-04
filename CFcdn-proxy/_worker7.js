export default {
	// 主函数，处理传入的 HTTP 请求
	async fetch(request, env, ctx) {
		// 解析请求的 URL
		let url = new URL(request.url);
		const 访问路径 = url.pathname;
		const 访问参数 = url.search;
		// 默认后端域名列表
		let 后端域名 = [
			'www.baidu.com',
			'www.sogou.com',
			'www.so.com'
		];
		
		// 如果环境变量中有 HOST，则使用 ADD 函数获取新的后端域名列表
		if(env.HOST) 后端域名 = await ADD(env.HOST);

		// 获取测试路径，默认为 '/sub'
		let 测试路径 = env.PATH || '/';
		// 确保测试路径以 '/' 开头
		if (测试路径.charAt(0) !== '/') 测试路径 = '/' + 测试路径;
		let 响应代码 = env.CODE || '200';
		// 打印后端域名的数量和列表
		console.log(`后端数量: ${后端域名.length}\n后端域名: ${后端域名}\n测试路径: ${测试路径}\n响应代码: ${响应代码}`);

		// 存储失效的后端域名
		let 失效后端 = [];

		// 封装请求逻辑的函数，带有超时功能
		async function fetchWithTimeout(resource, options = {}) {
			const { timeout = 1618 } = options;
			
			const controller = new AbortController();
			const id = setTimeout(() => controller.abort(), timeout);
			
			const response = await fetch(resource, {
				...options,
				signal: controller.signal
			}).finally(() => clearTimeout(id));
			
			return response;
		}

		// 封装选取后端域名并发起请求的逻辑
		async function getValidResponse(request, 后端域名) {
			// 当后端域名列表不为空时循环
			while (后端域名.length > 0) {
				// 随机选择一个后端域名
				const 随机后端 = 后端域名[Math.floor(Math.random() * 后端域名.length)];
				// 从后端域名列表中移除已选择的域名
				后端域名 = 后端域名.filter(host => host !== 随机后端);

				url.hostname = 随机后端; // 域名
				url.pathname = 测试路径.split('?')[0];
				url.search = 测试路径.split('?')[1] == "" ? "" : "?" + 测试路径.split('?')[1] ;
				try {
					// 发起请求，并设置超时时间
					const response = await fetchWithTimeout(new Request(url), { timeout: 1618 });
					// 如果响应状态为 200，表示请求成功
					if (response.status.toString() == 响应代码) {
						if (访问路径 != '/') url.pathname = 访问路径;
						console.log(`使用后端: ${url.hostname}`);
						//console.log(`失效后端: ${失效后端}`);
						console.log(`待选后端: ${后端域名}`);
						url.search = 访问参数;
						return await fetch(new Request(url, request));
					} else {
						console.log(`失效后端: ${url.hostname}:${response.status}`);
					}
				} catch (error) {
					// 捕获请求错误，将失效的后端域名添加到失效列表
					失效后端.push(随机后端);
				}
			}
			// 如果所有后端都失效，抛出错误
			return new Response('所有后端都不可用！', {
				status: 404,
				headers: { 'content-type': 'text/plain; charset=utf-8' },
				});
			//throw new Error('所有后端都不可用');
		}

		// 调用 getValidResponse 函数，获取有效的响应
		return await getValidResponse(request, 后端域名);
	}
}

async function ADD(envadd) {
	// 将制表符、双引号、单引号和换行符都替换为逗号
	// 然后将连续的多个逗号替换为单个逗号
	var addtext = envadd.replace(/[	 |"'\r\n]+/g, ',').replace(/,+/g, ',');
	
	// 删除开头和结尾的逗号（如果有的话）
	if (addtext.charAt(0) == ',') addtext = addtext.slice(1);
	if (addtext.charAt(addtext.length - 1) == ',') addtext = addtext.slice(0, addtext.length - 1);
	
	// 使用逗号分割字符串，得到地址数组
	const add = addtext.split(',');
	
	return add;
}
