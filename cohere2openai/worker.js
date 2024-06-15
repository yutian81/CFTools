async function handleRequest(req) {
  const { method, url, headers } = req;
  const { searchParams } = new URL(url);

  if (method === "OPTIONS") {
    return new Response("", {
      headers: {
        'Access-Control-Allow-Origin': '*',
        "Access-Control-Allow-Headers": '*'
      }, status: 204
    })
  }

  let body = {};
  try {
    reqBody = await req.json();
    body['messages'] = reqBody['messages'];
    body['model'] = reqBody['model'];
    body['temperature'] = reqBody['temperature'];
    body['max_tokens'] = reqBody['max_tokens'];
    body['stream'] = reqBody['stream'];
  } catch (e) {
    body = {
      "messages": [{ "role": "user", "content": searchParams.get('q') || "hello" }],
      "model": "command-r",
      "temperature": 0.5,
      "presence_penalty": 0,
      "frequency_penalty": 0,
      "top_p": 1,
      stream: true
    };
  }

  // delete frequency_penalty from body, cohere ai requires either frequency_penalty or presence_penalty, not both.
  delete body.frequency_penalty;

  const data = { chat_history: [] };
  try {
    for (let i = 0; i < body.messages.length - 1; i++) {
      data.chat_history.push({
        "role": body.messages[i].role === "assistant" ? "CHATBOT" : body.messages[i].role.toUpperCase(),
        "message": body.messages[i].content
      });
    }
    data.message = body.messages[body.messages.length - 1].content;
  } catch (e) {
    return new Response(e.message);
  }
  data.stream = body.stream === true;

  if ((body.model + "").indexOf("net-") === 0) data.connectors = [{ "id": "web-search" }];
  for (let i in body) {
    if (!/^(model|messages|stream)/i.test(i)) data[i] = body[i];
  }
  if (/^(net-)?command/.test(body.model)) data.model = body.model.replace(/^net-/, "");
  if (!data.model) data.model = "command-r";
  data.model = "command-r-plus"; // force to use command-r-plus， you can annotate this line if you want to use the default model.

  const resp = await fetch('https://api.cohere.ai/v1/chat', {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      'content-type': 'application/json',
      'Authorization': `bearer ${API_AUTH_TOKEN}`
    }
  });

  if (resp.status !== 200) return resp;

  const created = parseInt(Date.now() / 1000);

  if (!data.stream) {
    try {
      const ddd = await resp.json();
      return new Response(JSON.stringify({
        "id": "chatcmpl-QXlha2FBbmROaXhpZUFyZUF3ZXNvbWUK",
        "object": "chat.completion",
        "created": created,
        "model": data.model,
        "choices": [{
          "index": 0,
          "message": {
            "role": "assistant",
            "content": ddd.text || ddd.error
          },
          "logprobs": null,
          "finish_reason": "stop"
        }],
        "usage": {
          "prompt_tokens": 0,
          "completion_tokens": 0,
          "total_tokens": 0
        },
        "system_fingerprint": null
      }), {
        headers: {
          'Access-Control-Allow-Origin': '*',
          "Access-Control-Allow-Headers": '*',
          'Content-Type': 'application/json; charset=UTF-8'
        },
        status: resp.status
      });
    } catch (e) {
      return new Response(e.message);
    }
  }

  const { readable, writable } = new TransformStream();
  const my_stream_writer = writable.getWriter();

  (async () => {
    const reader = resp.body.getReader();
    let totalText = "";
    const decoder = new TextDecoder('utf-8', { stream: true });

    (async () => {
      const encoder = new TextEncoder();
      let isEnd = false;

      while (!isEnd) {
        await sleep(20);
        const msgs = totalText.split('\n');
        let index = 0;
        for (; index < msgs.length; index++) {
          try {
            const msg = JSON.parse(msgs[index]);
            if (msg.text) {
              const txt = JSON.stringify({
                "id": "chatcmpl-QXlha2FBbmROaXhpZUFyZUF3ZXNvbWUK",
                "object": "chat.completion.chunk",
                "created": created,
                "model": data.model,
                "choices": [{
                  "index": 0,
                  "delta": {
                    "role": "assistant",
                    "content": msg.text
                  },
                  "finish_reason": null
                }]
              });
              my_stream_writer.write(encoder.encode(`data: ${txt}\n\n`));
            }
            if (msg.is_finished) {
              await my_stream_writer.write(encoder.encode(`data: {"id":"chatcmpl-QXlha2FBbmROaXhpZUFyZUF3ZXNvbWUK","object":"chat.completion.chunk","created":${created},"model":"${data.model}","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}\n\n`));
              await my_stream_writer.close();
              isEnd = true;
            }
          } catch (e) {
            break;
          }
        }
        if (index < msgs.length) {
          totalText = msgs[msgs.length - 1];
        } else {
          totalText = "";
        }
      }
    })();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalText += decoder.decode(value, { stream: true });
    }
  })();

  return new Response(readable, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      "Access-Control-Allow-Headers": '*',
      'Content-Type': 'text/event-stream; charset=UTF-8'
    },
    status: resp.status
  });
}

async function sleep(ms) {
  return new Promise((r) => {
    setTimeout(r, ms);
  });
}

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});