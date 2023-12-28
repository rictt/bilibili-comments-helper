import { useState } from "react"
import img from 'data-base64:~assets/product-1.jpeg'

function IndexPopup() {
  return (
    <div>
      <a href="./options.html" target="_blank" style={{ display: "block", color: "red", textAlign: "center", lineHeight: 3, fontSize: "20px", letterSpacing: "1px", fontWeight: "bold" }}>
        详细使用手册
      </a>
      <img src={ img } alt="登录后使用" style={{ width: "500px" }} />
    </div>
  )
}

export default IndexPopup
