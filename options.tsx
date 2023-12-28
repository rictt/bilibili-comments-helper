import styleText from 'data-text:./options.module.less'
import style from './options.module.less'
import { useState } from 'react'
import ProductUse1 from 'data-base64:~assets/product-1.jpeg'
import ProductUse2 from 'data-base64:~assets/product-2.jpg'
import ProductUse3 from 'data-base64:~assets/product-3.jpg'

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = styleText
  return style
}

const menus = [
  { key: 'BasicUse', label: "基本使用" },
  { key: 'About', label: "关于" },
]

function Layout({ children }) {
  return <div className={style.layout}>
    {children}
  </div>
}

function Menu({ currentMenu, value, label, onClick }) {
  return <div onClick={onClick} className={`${style.menu} ${currentMenu === value ? style.menuActive : ''}`}>{ label }</div>
}

function RedText({ children }) {
  return <div className={style.redText}>{children}</div>
}

function TipText({ children }) {
  return <div className={style.tipText}>{children}</div>
}

function BasicUse() {
  return <div>
    <div>
      <RedText>重点必看</RedText>
      <hr />
      <div>
        <p>由于B站查看评论<strong>需要登录</strong>，本插件仅对页面上展示的数据进行汇总整理，<strong>不负责不保证</strong>大量请求接口是否会造成账号封禁，所以请按需使用！</p>
      </div>

      <div>
        <h2>【插件使用步骤】</h2>
        <div>
          <p>1、请先登录B站账号</p>
          <p>1、进到需要查看评论的视频页面</p>
          <p>2、插件会在页面右侧（如下图）注入常用的按钮</p>
          <p>3、按需进行下载热门评论</p>
          <TipText>提示：请谨慎使用「下载含回复」功能，可能造成浏览器卡顿</TipText>

          <img src={ProductUse1} style={{ width: "100%"}} />
        </div>
      </div>

      <hr />

      <div>
        <h2>【下载结果页面】</h2>
        <div>
          <p>下载完成后，会提示下载一个HTML，这是存放我们评论数据的静态页面，可以查看对应视频的一些基本信息、评论及分析数据</p>
          <p><strong>其他：关键字及情感</strong>（积极、消极）数据需要服务器支持，需要<strong>手动点击「获取完整分析」</strong></p>
          <TipText>如下图</TipText>
          <img src={ProductUse3} style={{ width: "100%" }} alt="" />
          <img src={ProductUse2} style={{ width: "125%" }} />
        </div>
      </div>
    </div>
  </div>
}

function About() {
  return <div>
    {/* <div></div> */}
    <blockquote>
      <TipText>当前版本：V0.0.1</TipText>
      <p><strong>本软件均仅用于学习交流，请勿用于任何商业用途！感谢大家！</strong></p>
      <p>反馈/联系：<span>2390923149@qq.com</span></p>
    </blockquote>
  </div>
}

const childMap = {
  BasicUse,
  About
}

function Left({ menu, setMenu }) {
  const onClickMenu = (key) => {
    setMenu(key)
  }
  return <div className={style.left}>
    <div className={style.title}>
      <h4>B站评论助手</h4>
      <span>v0.0.1</span>
    </div>
    <div style={{ flex: 1 }}>
      {menus.map(e => <Menu onClick={() => onClickMenu(e.key)} currentMenu={menu} value={e.key} label={e.label} key={e.key}></Menu>)}
    </div>
  </div>
}

function Right({ menu }) {
  const Child = childMap[menu]
  return <div className={style.right}>
    <Child key={menu} />
  </div>
}

export default function() {
  const [menu, setMenu] = useState('BasicUse')
  return <Layout>
    <Left menu={menu} setMenu={setMenu} />
    <Right menu={menu} />
  </Layout>
}