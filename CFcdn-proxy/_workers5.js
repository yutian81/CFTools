const HTML_HOMEPAGE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Proxy Everything</title>
    <style>
        body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 90vh;
            margin: 0;
        }
        .footer {
            text-align: center;
            position: fixed;
            bottom: 5%;
            width: 100%;
        }
    </style>
</head>
<body>
    <h1>Proxy Everything</h1>
    <form id="proxyForm">
        <label for="urlInput">Enter URL:</label>
        <input type="text" id="urlInput" name="url" required>
        <button type="submit">Proxy it!</button>
    </form>
    <script>
        document.getElementById('proxyForm').addEventListener('submit', function (event) {
            event.preventDefault();
            let url = document.getElementById('urlInput').value;
            if (!url.includes('://'))
                url = 'http://' + url;
            window.open(\`/?url=\${encodeURIComponent(url)}\`, '_blank');
        });
    </script>
    <div class="footer">
        This service is built from the GitHub repository <a
            href="https://github.com/xixu-me/Proxy-Everything" target="_blank">xixu-me/Proxy-Everything</a>.
    </div>
</body>
</html>
`;

function generateHtml() {
    return HTML_HOMEPAGE;
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function isInternalUrl(url) {
    const internalPatterns = [
        /^localhost$/,
        /^127\.\d+\.\d+\.\d+$/,
        /^192\.168\.\d+\.\d+$/,
        /^10\.\d+\.\d+\.\d+$/,
        /^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/
    ];
    return internalPatterns.some(pattern => pattern.test(url.hostname));
}

function logRequest(request) {
    console.log(`Request URL: ${request.url}`);
}

function logError(error) {
    console.error(`Error: ${error.message}`);
}

export default {
    async fetch(request) {
        logRequest(request);
        const url = new URL(request.url);
        let targetUrl = url.searchParams.get('url');
        if (!targetUrl) {
            return new Response(generateHtml(), { headers: { 'Content-Type': 'text/html' } });
        }

        if (!isValidUrl(targetUrl)) {
            return new Response('Invalid URL provided.', { status: 400 });
        }

        const targetUrlObj = new URL(targetUrl);
        if (isInternalUrl(targetUrlObj)) {
            return new Response('Access to internal URLs is not allowed.', { status: 403 });
        }

        const headers = new Headers({
            'User-Agent': 'Mozilla/5.0 (compatible; MyProxyBot/1.0; +http://www.example.com/bot.html)',
            'Referer': '',
            'X-Forwarded-For': '0.0.0.0'
        });

        const modifiedRequest = new Request(targetUrl, {
            method: request.method,
            headers: headers
        });

        try {
            const response = await fetch(modifiedRequest);
            const modifiedResponse = new Response(response.body, response);
            modifiedResponse.headers.set('X-Proxy-By', 'Cloudflare Worker');
            modifiedResponse.headers.set('Cache-Control', 'max-age=3600');
            return modifiedResponse;
        } catch (error) {
            logError(error);
            return new Response(`Error fetching the requested URL: ${error.message}`, { status: 500 });
        }
    }
};
