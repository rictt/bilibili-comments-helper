
import React, { useState } from "react"
import type { PlasmoCSConfig } from "plasmo";
import { writeToHTML, scrollToTop, getHTML, getInterval, scrollToBottom, extractReply, exportToExcel, exportTableToExcel } from '../utils'
import styleText from "data-text:./style.module.css"
import * as style from "./style.module.css"
import { onNestedReply } from "./content";

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = styleText
  style.setAttribute('id', 'cm-helper')
  return style
}

export const config: PlasmoCSConfig = {
  matches: [
    "https://www.bilibili.com/video/*"
  ]
}

export const global_data = {
  mainQuery: {},
}

export const extarct_config = {
  downloading: false,
  onMainChange: null,
  onNestedChange: null,
  // 主评论
  mainReplyCount: -1,
  // 主 + 副评论总数
  mainSubReplyCount: -1,
  // 下载模式
  mode: 'excel',
  upMid: null,
  setLoading: (value) => { }
}
export const commentInfoMap = new Map() // rpid -> reply
export const commentsListMap = new Map() // rpid -> []reply's children

function getVideoInfo() {
  const title = document.querySelector('.video-title')?.innerText || ''
  const viewCount = document.querySelector('.view.item')?.innerText || 0
  const publishTime = document.querySelector('.pubdate-text')?.innerText || ''
  const desc = document.querySelector('.desc-info-text')?.innerText || ''
  const tags = Array.from(document.querySelectorAll('.tag') || []).map(e => e.innerText).filter(e => e)
  const upInfo = {
    // avatar: document.querySelector('.bili-avatar-img')?.getAttribute('data-src'),
    avatar: document.querySelector('.up-avatar-wrap .bili-avatar-img')?.src ?? '',
    spaceLink: document.querySelector('.up-name')?.href,
    upname: document.querySelector('.up-name')?.innerText || '-',
    updesc: document.querySelector('.up-description')?.innerText || '-',
    mid: extarct_config?.upMid || null,
  }
  return {
    title,
    desc,
    viewCount,
    publishTime,
    tags,
    link: window.location.href,
    upInfo
  }
}

function getDownloadFileName() {
  const info = getVideoInfo()
  if (info.title) {
    return info.title + '.html'
  }
  return 'Bilibili_Helper.html'
}

function uniArr(list, uniKey) {
  const map = {}
  const result = []

  list.forEach(item => {
    if (map[item[uniKey]]) {
      return
    }
    result.push(item)
    map[item[uniKey]] = true
  })

  return result
}

function downloadComments(title = 'file.html', maxCount = 100000, withChildren = true) {
  let data = []
  const entries = commentInfoMap.entries()
  for (const [key, reply] of entries) {
    if (withChildren) {
      const children = commentsListMap.get(key)
      reply.children = uniArr(children || [], 'rpid')
    }
    data.push(reply)
  }
  data = data.slice(0, maxCount)

  const getTime = new Date().toLocaleString().replace(/\//g, '-')
  console.log('get time: ', getTime)
  console.log('mode = ', extarct_config.mode)
  if (extarct_config.mode === 'html') {
    const html = getHTML(JSON.stringify(data), JSON.stringify(getVideoInfo()), JSON.stringify(getTime))
    writeToHTML(html, title)
  } else if (extarct_config.mode === 'excel') {
    exportTableToExcel(data, title.replace('.html', ''))
  }
}

function noMoreComment() {
  return !!document.querySelector('.reply-end')
}

function noMoreCommentPromise() {
  return new Promise((resolve) => {
    let timer = null
    function check() {
      let node = document.querySelector('.reply-end')
      if (node) {
        resolve(true)
        clearTimeout(timer)
        timer = null
      } else {
        timer = setTimeout(() => {
          check()
        }, 300)
      }
    }

    check()
  })
}

/**
 * 流程：监听接口响应
 * 
 * 当点击按钮，模拟一次触底，试图触发评论接口
 *  - 有更多评论
 *    - 触发分页事件处理，可以执行逻辑判断
 *  - 没有更多：
 *    - 不会再触发逻辑判断，导致下载一直没有反应
 *    - 解决方案
 *      - 发起一个定时器？如果定时器函数被执行，则证明没有触发成功，直接导出数据（这个时间不稳定，网络情况等因素很多）
 *      - watch dom，有这个节点就手动执行一下handler
 */

function downloadTopComments(topNum = 100) {
  console.log(1)
  const handler = () => {
    const size = commentInfoMap.size
    if (extarct_config.mainReplyCount !== -1 && size >= extarct_config.mainReplyCount || noMoreComment()) {
      extarct_config.setLoading(false)
      downloadComments(getDownloadFileName(), topNum, false)
      extarct_config.onMainChange = null
      extarct_config.mainReplyCount = -1
    } else {
      setTimeout(() => {
        scrollToBottom()
      }, getInterval(1000))
    }
  }
  scrollToTop()
  setTimeout(() => {
    extarct_config.onMainChange = handler
    extarct_config.mainReplyCount = topNum
    extarct_config.setLoading(true)
    scrollToBottom()
  }, 100)

  noMoreCommentPromise()
    .then(() => {
      handler()
    })
}

function downloadNestedCommentByAPI(root = '') {
  const result = [];
  let totalCount = 0;
  const getReplyList = (page = 1) => {
    return new Promise((resolve, reject) => {
      const { oid = '' } = global_data.mainQuery;
      const url = `https://api.bilibili.com/x/v2/reply/reply?type=1&oid=${oid}&sort=2&ps=20&root=${root}&pn=${page}`
      fetch(url)
        .then(res => res.json())
        .then(res => {
          console.log('call onNestedReply');
          onNestedReply(res.data, {
            oid,
            root,
          })
          console.log('res: ', res);
          const { page, replies } = res.data;
          const { count } = page || { count: 0 }
          totalCount = totalCount || count;
          resolve({
            list: replies,
            count,
          })
        }).catch(() => ({ list: []}));
    })
  }

  const handler = (pageSize = 1, callback) => {
    getReplyList(pageSize)
      .then((res) => {
        const { list } = res || {};
        result.push(...list)
        if (totalCount && result.length >= totalCount) {
          const item = commentInfoMap.get(root);
          if (item) {
            item._child_loaded = true;
            commentInfoMap.set(root, item);
          }
          callback(result);
        } else {
          setTimeout(() => {
            handler(pageSize + 1, callback);
          }, getInterval())
        }
      })
  }
  return new Promise((resolve, reject) => {
    if (!root) {
      resolve(true);
      return;
    }
    const item = commentInfoMap.get(root);
    if (item && item._child_loaded) {
      resolve(true);
      return;
    }
    return handler(1, () => {
      resolve(true);
    })
  })
}

async function downloadCommentsWithNestedByPage(topNum = 10) {
  const promiseList = []
  let maxIndex = topNum;
  let index = 0;
  extarct_config.setLoading(true);
  for (const [key, value] of commentInfoMap.entries()) {
    if (index >= maxIndex) {
      break;
    }
    index++;
    promiseList.push(downloadNestedCommentByAPI(key));
  }
  await Promise.all(promiseList);
  extarct_config.setLoading(false);
  downloadComments(getDownloadFileName(), topNum, true)
}
function downloadCommentsWithNested(topNum = 10) {
  extarct_config.mainSubReplyCount = topNum
  let targetIndex = 0
  let maxTargetIndex = topNum
  let allReplyNode = document.querySelectorAll('.reply-item')
  let targetReply = allReplyNode[targetIndex]
  if (!targetReply) {
    console.error(`Not found the target reply by index ${targetIndex}, ${targetReply}`)
    return
  }

  const handleTaskFinish = () => {
    extarct_config.onNestedChange = null
    console.log('downloadCommentsWithNested结束')
    extarct_config.setLoading(false)
    downloadComments(getDownloadFileName(), extarct_config.mainSubReplyCount, true)
    extarct_config.mainSubReplyCount = -1
  }

  const handler = () => {
    setTimeout(() => {
      const list = document.querySelectorAll('.reply-item')
      const target = list[targetIndex]
      const moreBtn = target ? target.querySelector('.view-more-btn') : null
      const currentPage = target ? target.querySelector('.current-page') : null
      const nextPage = currentPage?.nextSibling
      const nextReplyItem = target?.nextElementSibling
      const noMore = noMoreComment() && !nextReplyItem && !nextPage
      if (targetIndex > maxTargetIndex || noMore) {
        handleTaskFinish()
        return
      }

      if (!target) {
        scrollToBottom()
        setTimeout(() => {
          targetIndex++
          handler()
        }, getInterval())
        return
      }

      if (moreBtn) {
        moreBtn.click()
        return
      }

      if (!currentPage || !nextPage || !nextPage?.click) {
        targetIndex++
        handler()
        return
      }

      nextPage.click()
    })
  }

  scrollToTop()
  extarct_config.onNestedChange = handler
  extarct_config.setLoading(true)
  handler()

  // noMoreCommentPromise()
  //   .then(() => {
  //     handler()
  //   })
}

export function Button({ children, onClick = () => { } }) {
  return <div className={ style.button } onClick={ onClick }>{ children }</div>
}

function DownloadIndexCommentCustom(props = { count: 100 }) {
  const { count } = props
  const onClick = () => {
    console.log('custom get: ', count)
    if (count) {
      downloadTopComments(count)
    }
  }
  return <>
    <Button onClick={ onClick }>自定义获取</Button>
  </>
}

function DownloadIndexCommentNestedCustom(props = { count: 10 }) {
  const { count } = props
  const onClick = async () => {
    console.log('custom get: ', count)
    const list = [];
    if (count) {
      downloadCommentsWithNestedByPage(count);
    }
  }
  return <>
    <Button onClick={ onClick }>自定义获取（含回复）</Button>
  </>
}

export function DownloadTop() {
  const onClick = () => {
    downloadTopComments(300)
  }
  return <Button onClick={ onClick }>热门前300</Button>
}

export function DownloadTopWithNested() {
  const onClick = () => {
    // downloadCommentsWithNested(10)
    downloadCommentsWithNestedByPage(10);
  }
  return <Button onClick={ onClick }>热门前10（含回复）</Button>
}

export function UpInfoButton() {
  const onClick = () => {
    scrollToTop()
    console.log(getVideoInfo())
  }
  return <Button onClick={ onClick }>获取UP</Button>
}

export default function Content() {
  const [count, setCount] = useState(100)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('excel')
  extarct_config.setLoading = setLoading

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const __count = parseInt(e.target.value)
    setCount(__count || 0)
    e.stopPropagation()
    e.preventDefault()
  }

  const onModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('new mode: ', e.target.value)
    extarct_config.mode = e.target.value
    setMode(e.target.value)
  }



  return <div className={ `${style.wrapper} ${loading ? style.loading : ''}` }>
    <DownloadTop />
    <DownloadTopWithNested />
    <div>
      <input defaultValue={ count } onKeyDown={ (e) => e.stopPropagation() } onChange={ onInputChange } className={ style['input'] } placeholder="条数" />
    </div>
    <DownloadIndexCommentCustom count={ count } />
    <DownloadIndexCommentNestedCustom count={ count } />
    <fieldset>
      <legend>导出格式</legend>
      <div>
        <label>
          <input type="radio" id="radio_excel" name="format" checked={ mode === 'excel' } value="excel" onChange={ onModeChange } />
          Excel
        </label>
        <label>
          <input type="radio" id="radio_html" name="format" checked={ mode === 'html' } value="html" onChange={ onModeChange } />
          HTML
        </label>
      </div>
    </fieldset>
    { loading ? <div className={ style.loadingText }>正在处理...请勿重复操作</div> : null }
  </div>
}


export const getMountPoint = async () => document.querySelector("body")
