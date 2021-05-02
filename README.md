# geek-university-frontend

## week01

- 基于`net`(TCP) 模块封装 Request 类，实现 http 请求与解析
- 按照 http 请求报文格式将封装请求内容
- 接收服务器数据返回后，开始解析`ResponseParser`

## week02

- 根据 html 字符串手动转换成 dom 树
- 解析 css 样式
- 计算 css : 解析到 startTag 的时候，就去遍历判断匹配到了哪些 css 规则
- 计算 css 的假设，解析 html 内部 startTag 的时候，cssRules 已经计算完毕
- 实际场景中 html、body、head 等标签中可能也会添加样式，会触发 css 的重新计算，这里我们先忽略掉
- 获取父元素序列
- 计算样式优先级，按优先级覆盖之前的样式，添加到 dom 节点上

## week03

> layout

- layout 类型： 传统排版、flex 排版、grid 排版
- 根据浏览器属性来进行排版
- 分行算法：把元素分进“行”（hang）
- 若主轴设置 no-wrap 则强行分配进第一行


