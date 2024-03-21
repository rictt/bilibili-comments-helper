import ExcelJS from 'exceljs'

export function getInterval(min = 500) {
  return Math.max(min, Math.random() * 3000)
}

type excelParamsType = {
  style?: Record<string, any> // excel表的样式配置
  tableData: any[] // 表的数据内容
  headerColumns: any[] //表头配置
  sheetName: string // 工作表名
}

export async function exportToExcel(options: excelParamsType) {
  const { sheetName, style, headerColumns, tableData } = options
  console.log(2)

  // import('exceljs').then(async (module) => {
    // const ExcelJS = module
    const workbook = new ExcelJS.Workbook();
    workbook.title = sheetName;
    workbook.creator = 'joey'
    workbook.created = new Date()
    const worksheet = workbook.addWorksheet('Sheet1');
    if (headerColumns.length > 0) {
      // 设置列头
      const columnsData = headerColumns.map((column, index) => {
        const width = column.width
        return {
          header: column.header,
          key: column.key,
          width: isNaN(width) ? undefined : width
        }
      })
      worksheet.columns = columnsData
    }

    // 设置表头样式
    if (style) {
      const headerRow = worksheet.getRow(1)
      headerRow.eachCell((cell) => {
        cell.style = style
      })
    }

    // 设置行数据
    if (tableData.length > 0) {
      tableData.forEach(row => {
        worksheet.addRow(row)
      })
    }
    console.log(worksheet)
    const buffer = await workbook.xlsx.writeBuffer()
    writeFile(sheetName, buffer);
}

export const writeFile = (fileName, content) => {
  const link = document.createElement("a");
  const blob = new Blob([content], {
    type: "application/vnd.ms-excel;charset=utf-8;"
  });
  link.download = fileName;
  link.href = URL.createObjectURL(blob);
  link.click();
};

export function extractReply(reply) {
  if (!reply) {
    return console.error("The reply was empty!!")
  }
  const { rpid, mid, member, content, parent, rcount, like, ctime, up_action, reply_control } = reply || {}

  return {
    rpid,
    member,
    memberName: member && member.uname || '',
    comment: content ? content.message : '',
    pictures: content?.pictures || [],
    parent,
    rcount,
    mid,
    like,
    ctime,
    reply_control,
    location: reply_control?.location?.replace?.('IP属地：', '') ?? '',
    upLike: up_action && up_action.like || false
  }
}

export function scrollToBottom() {
  window.scrollTo(0, 1000000000)
}

export function scrollToTop() {
  window.scrollTo(0, 0)
}

export function replaceReplyPrefix(str: string) {
  return str?.replace(/回复 [^:]+ :/i, '')
}

export function exportTableToExcel(data: any[], sheetName: string) {
  const list = []
  for (let i = 0; i < data.length; i++) {
    const { children, ...rest } = data[i]
    list.push({
      ...rest,
      isFirst: '是',
      rpid: rest.rpid + '',
      ctime: rest.ctime ? new Date(rest.ctime * 1000).toLocaleString() : '-' 
    })
    if (children && children.length) {
      for (let j = 0; j < children.length; j++) {
        list.push({
          ...children[j],
          rpid: children[j].rpid + '',
          comment: replaceReplyPrefix(children[j].comment),
          ctime: children[j].ctime ? new Date(children[j].ctime * 1000).toLocaleString() : '-' 
        })
      }
    }
  }
  exportToExcel({
    sheetName,
    tableData: list,
    headerColumns: [...XLSL_Columns]
  })
}

export const XLSL_Columns = [
  { header: '一级评论', key: 'isFirst' },
  { header: '评论ID', key: 'rpid', width: 30 },
  { header: '用户', key: 'memberName', width: 40 },
  { header: '评论', key: 'comment', width: 50 },
  { header: '点赞数', key: 'like' },
  { header: '内评论数', key: 'rcount' },
  { header: '评论时间', key: 'ctime', width: 15 },
]

const nameList = [
  {
    "name": "cdn.staticfile.org",
    "others": [
      "element-ui",
      "2.15.14",
      "theme-chalk",
      "index.min.css"
    ]
  },
  {
    "name": "cdn.staticfile.org",
    "others": [
      "element-ui",
      "2.15.14",
      "index.min.js"
    ]
  },
  {
    "name": "cdn.bootcdn.net",
    "others": [
      "ajax",
      "libs",
      "vue",
      "2.6.13",
      "vue.min.js"
    ]
  },
  {
    "name": "cdn.jsdelivr.net",
    "others": [
      "npm",
      "echarts@5.4.3",
      "dist",
      "echarts.min.js"
    ]
  }
]

export const getIndex = (index) => {
  const target = nameList[index]
  return window.atob('aHR0cHM6Ly8=') + target.name + '/' + target.others.join('/')
}

// export const CDN = {
//   ELE_CSS: `https://cdn.staticfile.org/element-ui/2.15.14/theme-chalk/index.min.css`,
//   ELE_JS: `https://cdn.staticfile.org/element-ui/2.15.14/index.min.js`,
//   VUE_JS: `https://cdn.bootcdn.net/ajax/libs/vue/2.6.13/vue.min.js`,
//   ECHATS_JS: `https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js`
// }

export function getHTML(data, videoInfo = {}, getTime) {
  const STATIC_HTML = `
  <!DOCTYPE html>
  <html>
  
  <head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="${getIndex(0)}">
    <style>
      body {
        margin: 0;
      }
      #app {
        padding: 10px;
      }
      #echarts {
        display: flex;
        align-items: center;
        box-sizing: border-box;
      }
      #echarts .chart {
        display: inline-block;
        width: 350px;
        min-width: 350px;
        height: 320px;
      }

      .video-form .el-form-item {
        margin-bottom: 0;
      }

      .help {
        position: fixed;
        right: 10px;
        bottom: 40px;
        z-index: 2001;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      [v-cloak] {
        display: none;
      }
    </style>
  </head>
  
  <body>
  <div id="app" v-loading="loading" v-cloak>
    <div class="up-info">
      <el-card>
        <h4 style="margin: 4px 0;">视频信息</h4>
        <el-form size="mini" class="video-form" label-width="90px" label-position="left">
          <el-form-item label="原视频：">
            <el-link :href="videoInfo.link" type="primary" target="_blank">{{ videoInfo.title }}</el-link>
          </el-form-item>
          <el-form-item label="视频描述：">{{ videoInfo.desc }}</el-form-item>
          <el-form-item label="发布时间：">{{ videoInfo.publishTime }}</el-form-item>
          <el-form-item label="作者：">
            <div style="display: flex;">
              <img v-if="videoInfo?.upInfo?.avatar" :src="videoInfo?.upInfo?.avatar" style="min-width: 40px; width: 40px; height: 40px; border-radius: 50%;" />
              <div style="display: inline-flex; flex-direction: column; align-items: start; padding-left: 10px;">
                <el-link :href="videoInfo?.upInfo?.spaceLink" type="primary" target="_blank">{{ videoInfo?.upInfo?.upname }}</el-link>
                <span style="color: #666;">{{ videoInfo?.upInfo?.updesc }}</span>
              </div>
            </div>
          </el-form-item>
          <el-form-item label="抓取时间：">{{ updateTime }}</el-form-item>
          <el-form-item label="评论数：">{{ totalComments }}</el-form-item>
        </el-form>
      </el-card>
      <el-card style="margin: 10px 0;">
        <h4 style="margin: 4px 0;">数据分析
          <el-button size="mini" @click="getComplete">获取完整分析</el-button>
        </h4>
        <div style="display: flex;">
          <el-table :data="rankData" border style="width: 300px; min-width: 300px; max-width: 300px; min-height: 300px; max-height: 400px; overflow: auto;" size="mini">
            <el-table-column prop="order" label="排名"></el-table-column>
            <el-table-column prop="keyword" label="关键字"></el-table-column>
            <el-table-column prop="count" label="出现次数"></el-table-column>
          </el-table>
          <div style="margin-left: 4px; overflow: auto;">
            <el-checkbox-group v-model="echartsShowList" size="mini" style="margin-top: 4px;">
              <el-checkbox-button label="gender">性别</el-checkbox-button>
              <el-checkbox-button label="vip">VIP等级</el-checkbox-button>
              <el-checkbox-button label="location">地域分布</el-checkbox-button>
              <el-checkbox-button label="level">用户等级</el-checkbox-button>
              <el-checkbox-button label="emotion">情感</el-checkbox-button>
            </el-checkbox-group>
            <div id="echarts" style="overflow: auto;">
              <div id="gender-stat" class="chart" v-show="echartsShowList.includes('gender')"></div>
              <div id="vip-stat" class="chart" v-show="echartsShowList.includes('vip')"></div>
              <div id="location-stat" class="chart" v-show="echartsShowList.includes('location')"></div>
              <div id="level-stat" class="chart" v-show="echartsShowList.includes('level')"></div>
              <div id="emotion-stat" class="chart" v-show="echartsShowList.includes('emotion')"></div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <el-card>
      <h4 style="margin: 4px 0;">完整数据</h4>
      <el-button type="primary" @click="showHideAll">{{ showAll ? '隐藏' : '展示数据' }}</el-button>

      <el-form v-show="showAll" size="mini" label-position="left" inline style="margin-top: 10px;">
        <el-form-item label="搜索：">
          <el-input v-model="keyword" @input="onKeyword" style="width: 260px" clearable />
        </el-form-item>
        <el-form-item label="总评论数：">{{ totalComments }}（其中主评论：{{ mainCommentCount }}, 楼中评论：{{ nestedCommentCount }}）</el-form-item>
      </el-form>
      <el-table 
        v-if="showAll"
        :data="tableData" 
        border 
        style="width: 100%; overflow: auto; " 
        size="mini" row-key="rpid" :load="load" lazy :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      >
        <el-table-column prop="rpid" label="评论ID" width="170px"></el-table-column>
        <el-table-column prop="memberName" label="用户" width="140px"></el-table-column>
        <el-table-column prop="comment" label="评论" show-overflow-tooltip></el-table-column>
        <el-table-column prop="like" label="点赞数" width="100px" sortable></el-table-column>
        <el-table-column prop="rcount" label="内评论数" width="100px" sortable></el-table-column>
        <el-table-column prop="ctime" label="评论时间" width="160px" sortable>
          <template #default="{ row }">
            {{ row.ctime ? new Date(row.ctime * 1000).toLocaleString() : '-' }}
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-if="showAll"
        style="margin: 10px 0;"
        background
        layout="prev, pager, next, sizes"
        :page-sizes="[10, 20, 30, 40, 50, 100]"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="originTableData.length"
        @size-change="onPageChange(currentPage, $event)"
        @current-change="onPageChange($event, pageSize)"
        >
      </el-pagination>
    </el-card>

    <el-card style="margin: 10px 0;">
      <h4 style="margin: 4px 0;">UP评论/回复</h4>
      <el-button type="primary" style="margin-bottom: 10px;" @click="showAllUpData = !showAllUpData">{{ showAllUpData ? '隐藏' : '展示数据' }}</el-button>
      <el-table v-if="showAllUpData" :data="upTableData" border style="width: 100%; overflow: auto; " size="mini"
        row-key="rpid">
        <el-table-column prop="rpid" label="评论ID" width="170px"></el-table-column>
        <el-table-column prop="memberName" label="用户" width="140px"></el-table-column>
        <el-table-column prop="comment" label="评论" show-overflow-tooltip></el-table-column>
        <el-table-column prop="like" label="点赞数" width="100px" sortable></el-table-column>
        <el-table-column prop="rcount" label="内评论数" width="100px" sortable></el-table-column>
        <el-table-column prop="ctime" label="评论时间" width="160px" sortable>
          <template #default="{ row }">
            {{ row.ctime ? new Date(row.ctime * 1000).toLocaleString() : '-' }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <div class="help">
      <div class="help-item">
        <el-button type="primary" icon="el-icon-download" @click="downloadOrigin">原始数据</el-button>
      </div>
    </div>
  </div>
  </body>

  <script src="${getIndex(2)}"></script>  
  <script src="${getIndex(1)}"></script>
  <script src="${getIndex(3)}"></script>
  <script>
    const __tableData = ${data}
  </script>

  <script>
  const videoInfo = ${videoInfo}
  const tableData = __tableData.map(e => {
    return {
      ...e,
      children: e?.children?.length ? e.children.map(child => {
        return {
          ...child,
          comment: child?.comment?.replace(/回复 [^:]+ :/i, '')
        }
      }) : null,
      hasChildren: !!e?.children?.length
    }
  })
  const genderStat = {}
  const levelStat = {}
  const vipStat = {}
  const locationStat = {}
  const members = new Map()
  const wordsMap = new Map() // word -> priority: number

  function updateSensitive(segments) {
    for (const se of segments) {
      const key = se.segment
      if (!se.isWordLike || key.length < 2) {
        continue
      }
      const priority = wordsMap.get(key) || 0
      wordsMap.set(key, priority + 1)
    }
  }
  
  function splitTextToWords(text) {
    const segmenter = new Intl.Segmenter("ch", { granularity: "word" })
    return Array.from(segmenter.segment(text));
  }

  function outputSortMap() {
    const sortResult = Array.from(wordsMap.entries()).map(e => ({
      word: e[0],
      priority: e[1]
    })).sort((a, b) => b.priority - a.priority)
    return sortResult
  }

  function statItem(source, key) {
    if (!source || !key) {
      return
    }
    if (!source[key]) {
      source[key] = 0
    }
    source[key]++
  }

  function statSex(item) {
    const sex = item?.member?.sex
    statItem(genderStat, sex)
  }
  
  function statLevel(item) {
    const level = item?.member?.level_info?.current_level
    statItem(levelStat, level)
  }
  
  function statVip(item) {
    const vipText = item?.member?.vip?.label?.text
    statItem(vipStat, vipText || '无会员')
  }
  
  function statLocation(item) {
    const location = item?.location
    statItem(locationStat, location || '未知')
  }
  
  function statMembers(item) {
    const mid = item?.member?.mid
    if (members.get(mid)) {
      return
    }
    
    statSex(item)
    statLevel(item)
    statVip(item)
    statLocation(item)
    members.set(mid, item?.member)
  }

  
  function lookData() {
    tableData.forEach(item => {
      statMembers(item)
      updateSensitive(splitTextToWords(item.comment))
      if (item.children) {
        item.children.forEach(child => {
          statMembers(child)
          updateSensitive(splitTextToWords(child.comment))
        })
      }
    })
  }

  lookData()


  new Vue({
    el: '#app',
    data: function () {
      return {
        echartsShowList: ['gender', 'vip', 'location'],
        originTableData: tableData,
        videoInfo,
        tableData: [],
        rankData: [],
        keyword: '',
        currentPage: 1,
        pageSize: 100,
        loading: false,
        showAll: false,
        showAllUpData: false,
        // updateTime: new Date().toLocaleString().replace(/\//g, '-')
        updateTime: ${getTime}
      }
    },
    computed: {
      upTableData() {
        const list = this.originTableData
        const upMid = this.videoInfo?.upInfo?.mid
        const result = []
        for (const item of list) {
          const { children, ...rest } = item
          if (item.mid === upMid) {
            result.push(rest)
          }
          if (children?.length) {
            for (const child of children) {
              if (child.mid === upMid) {
                result.push(child)
              }
            }
          }
        }
        return result
      },
      mainCommentCount() {
        return this.originTableData.length
      },
      nestedCommentCount() {
        let len = 0
        this.originTableData.forEach(item => {
          if (item.children) {
            len += item.children.length
          }
        })
        return len
      },
      totalComments() {
        return this.mainCommentCount + this.nestedCommentCount
      }
    },

    created() {
      this.setTableData(this.currentPage, this.pageSize)
    },

    methods: {
      downloadOrigin() {
        const link = document.createElement('a')
        const data = JSON.stringify(this.originTableData, null, 2)
        const url = window.URL.createObjectURL(
          new Blob([data])
        )
        link.download = 'data.json'
        link.href = url
        link.click()
        window.URL.revokeObjectURL(url)
      },
      showHideAll() {
        this.showAll = !this.showAll
      },
      setTableData(pageIndex, pageSize) {
        const start = (pageIndex - 1) * pageSize
        const end = start + pageSize
        console.log(start, end)
        this.tableData = this.originTableData.slice(start, end)
      },
      onPageChange(currentPage, pageSize) {
        this.currentPage = currentPage
        this.pageSize = pageSize
        console.log(currentPage, pageSize)
        this.setTableData(currentPage, pageSize)
      },
      onKeyword(keyword) {
        console.log(keyword)
        if (!keyword) {
          this.tableData = [...this.originTableData]
          return
        }
        this.tableData = this.originTableData.filter(e => {
          return e?.comment?.indexOf(keyword) !== -1 || e?.memberName?.indexOf(keyword) !== -1
        })
      },
      load(tree, treeNode, resolve) {
        resolve(tree.children || [])
      },
      getFlatDataList() {
        const data = this.tableData
        const result = []
        for (const item of data) {
          const { children, ...rest } = item
          if (children && children.length) {
            for (const child of children) {
              result.push(child)
            }
          }
          result.push(rest)
        }
        return result
      },
      getComplete() {
        const replies = this.getFlatDataList().map(e => {
          return {
            content: e.comment.replace(/回复\s@[\w\u4e00-\u9fa5]+\s:/g, ''),
            reply_id: e.rpid
          }
        })
        this.loading = true
        this.sendPost("https://zikao365.online/bili/analyse", {
          "top": 20,
          "replies": replies
        }).then(res => {
          console.log(res)
          const { keywords, emotions } = res
          this.rankData = (keywords || []).map((e, index) => {
            return {
              order: index + 1,
              keyword: e[0],
              count: e[1]
            }
          })

          const sourceList = this.getFlatDataList()
          ;(emotions || []).forEach(item => {
            const { reply_id, score } = item
            const target = sourceList.find(e => e.rpid === reply_id)
            if (target) {
              target.score = score
            }
          })
          const positiveItems = emotions.filter(e => e.score >= 0.55)
          const negativeItems = emotions.filter(e => e.score <= 0.45)
          const neutralItems = emotions.filter(e => e.score > 0.45 && e.score < 0.55)
          this.echartsShowList.push('emption')
          const emotionChart = echarts.init(document.querySelector('#emotion-stat'))
          const stat = {
            "积极倾向": positiveItems.length,
            "中立": neutralItems.length,
            "消极倾向": negativeItems.length
          }
          const emotionList = Object.entries(stat).map(e => ({ name: e[0], value: e[1] }))
          const emotionOption = getPieOption({ title: '情感', data: emotionList, subtext: '用户数：' + members.size })
          emotionChart.setOption(emotionOption)
        }).finally(() => {
          this.loading = false
        })
      },
      sendPost(url, json) {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhr.timeout = 1000 * 60
          xhr.onerror = reject
          xhr.ontimeout = reject
          xhr.open("POST", url)
          xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
          xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
              try {
                xhr.response && resolve(JSON.parse(xhr.response));
              } catch (error) {
                console.log(error)
                resolve(xhr.response);
              }
            }
          }
          xhr.send(JSON.stringify(json))
        })
      },
    }
  })

</script>

<script>
// const myChart = echarts.init(document.querySelector('#main'))
const getPieOption = ({ title, subtext, data }) => {
  return {
    tooltip: {
      trigger: 'item'
    },
    title: {
      text: title,
      subtext: subtext || '',
      left: "center",
      top: "center"
    },
    // legend: {
    //   top: '1%',
    //   left: 'center',
    //   data: data.map(e => e.name)
    // },
    series: [
      {
        type: 'pie',
        data: data,
        radius: ['40%', '70%']
      }
    ]
  }
}

const chartNames = ['gender-stat', 'level-stat', 'vip-stat']
const genderChart = echarts.init(document.querySelector('#gender-stat'))
const levelChart = echarts.init(document.querySelector('#level-stat'))
const vipChart = echarts.init(document.querySelector('#vip-stat'))
const locationChart = echarts.init(document.querySelector('#location-stat'))

const genderList = Object.entries(genderStat).map(e => ({ name: e[0], value: e[1] }))
const genderOption = getPieOption({ title: '用户性别', data: genderList, subtext: '用户数：'+ members.size })
genderChart.setOption(genderOption)

const levelList = Object.entries(levelStat).map(e => ({ name: e[0], value: e[1] }))
const levelOption = getPieOption({ title: '等级分布', data: levelList, subtext: '用户数：' + members.size })
levelChart.setOption(levelOption)

const vipList = Object.entries(vipStat).map(e => ({ name: e[0], value: e[1] }))
const vipOption = getPieOption({ title: '会员开通情况', data: vipList, subtext: '用户数：' + members.size })
vipChart.setOption(vipOption)

const locationList = Object.entries(locationStat).map(e => ({ name: e[0], value: e[1] }))
const locationOption = getPieOption({ title: '地域分布', data: locationList, subtext: '用户数：' + members.size })
locationChart.setOption(locationOption)

</script> 

  </html>
  
  `

  return STATIC_HTML
}

export function writeToHTML(html, fileName = 'file.html') {
  const url = window.URL.createObjectURL(
    new Blob([html])
  );
  const a = document.createElement("a");

  a.href = url;
  a.download = fileName
  a.click();
  window.URL.revokeObjectURL(url);
}