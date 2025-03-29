/**
 * 上下文隔离
 */

import type { PlasmoCSConfig } from "plasmo"
import { extractReply } from "~utils";
import { commentInfoMap, commentsListMap, extarct_config, global_data } from "./content-ui";

export const config: PlasmoCSConfig = {
  matches: ["https://www.bilibili.com/video/*"],
}

window.addEventListener('message', function (e) {
  switch (e.data.type) {
    case "networkRequest":
      try {
        handleRequestData(e.data.data)
      } catch (error) {
        console.log(e, error)
      }
      break
    }
})

const handlers = {
  "reply/wbi/main": onMainComments,
  "reply/reply": onNestedReply
}

function handleRequestData(json) {
  const { url, query, data } = json
  Object.keys(handlers).forEach(key => {
    if (url.indexOf(key) !== -1) {
      const handler = handlers[key]
      handler(data.data, query)
    }
  })
}

function onMainComments(data, apiQuery) {
  const { top_replies, replies, upper } = data
  if (apiQuery) {
    global_data.mainQuery = apiQuery;
  }
  if (top_replies) {
    top_replies.forEach(reply => {
      handleReply(reply)
    })
  }
  if (replies) {
    replies.forEach(reply => {
      handleReply(reply)
    })
  }

  if (upper && upper.mid) {
    extarct_config.upMid = upper.mid
  }

  output()

  if (extarct_config.onMainChange) {
    extarct_config.onMainChange()
  }
}

export function onNestedReply(data, apiQuery) {
  if (!apiQuery || !apiQuery.root) {
    return console.error('Not found the root rpid!!')
  }
  const { replies, } = data
  if (replies) {
    replies.forEach(reply => {
      handleNestedReply(reply)
    })
  }
  output()

  if (extarct_config.onNestedChange) {
    extarct_config.onNestedChange()
  }
}


function handleReply(reply) {
  const { rpid } = reply || {}
  if (!rpid) {
    return console.log("The Reply without rpid!!")
  }
  if (!commentInfoMap.get(rpid)) {
    commentInfoMap.set(rpid, extractReply(reply))
  }
  if (reply?.replies?.length) {
    const list = reply.replies || []
    const result = []
    for (const item of list) {
      result.push(extractReply(item))
    }
    commentsListMap.set(rpid, result)
  }
}

function handleNestedReply(reply) {
  const { root } = reply
  if (!root) {
    return console.log("The reply without parent Id")
  }
  const comments = commentsListMap.get(root) || []
  comments.push(extractReply(reply))
  commentsListMap.set(root, comments)
}

function output() {
  console.log('OutPut: ', new Date().toLocaleString())
  console.log('replys: ', commentInfoMap.size, commentInfoMap)
  console.log('nested replys: ', commentsListMap.size, commentsListMap)
}

function injectScript() {
  const src = chrome.runtime.getURL('injected.js')
  const script = document.createElement('script')
  script.src = (src as string);
  ;(document.head || document.documentElement).appendChild(script)
  console.log(src)
  console.log('%c Bilibili Comments Helper 注入成功！', 'color: #111; font-weight: 700;')
}

injectScript()
