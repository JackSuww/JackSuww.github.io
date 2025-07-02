---
title: 流式数据接收+打字机效果展示
date: 2024-11-07
author: JackSu
categories:
  - 前端
tags:
  - Vue
---

集成大语言模型，实现智能对话

```javascript
let url = 'http://10.0.28.4:3002/api/v1/chat/completions'
let method = 'post'
let headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer fastgpt-200UGZRm0PUxykWSM2Bp5fZfLncA0uwNtjNXQU8jhAyGgVIjI8zWuP8dFWh'
}
let param = {
    "model": 'chatglm',
    "chatId": 10,
    "stream": true,
    "messages": [
        {
        "role": "user",
        "content": data.message
        }
	]
}

const resp = await fetch(url, {
    method: method,
    headers: headers,
    body: JSON.stringify(param)
})
const reader = resp.body.getReader();
const textDecoder = new TextDecoder("utf-8");
while (true) {
    const { done, value } = await reader.read()
    if (done) {
    	break;
    }
    let decodedValue = textDecoder.decode(value);
    const dataString = decodedValue.substring(decodedValue.indexOf('{'));
    try {
        let data = JSON.parse(dataString)
        let content = data.choices[0].delta.content
        if (content !== '' || content !== '\\n') {
        this.historyChatList[this.historyChatList.length - 1].message += content
        this.scrollToBottom()
    	}
    } catch (error) {
   		this.chatLoading = false
    }
}

// 滚动条定位点到最下面
scrollToBottom() {
    const container = this.$refs.chatList;
    container.$el.scrollTop = container.$el.scrollHeight;
}
```
