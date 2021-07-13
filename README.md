# geek-university-frontend

# week01

- 基于`net`(TCP) 模块封装 Request 类，实现 http 请求与解析
- 按照 http 请求报文格式将封装请求内容
- 接收服务器数据返回后，开始解析`ResponseParser`

# week02

- 根据 html 字符串手动转换成 dom 树
- 解析 css 样式
- 计算 css : 解析到 startTag 的时候，就去遍历判断匹配到了哪些 css 规则
- 计算 css 的假设，解析 html 内部 startTag 的时候，cssRules 已经计算完毕
- 实际场景中 html、body、head 等标签中可能也会添加样式，会触发 css 的重新计算，这里我们先忽略掉
- 获取父元素序列
- 计算样式优先级，按优先级覆盖之前的样式，添加到 dom 节点上

# week03

> layout

- layout 类型： 传统排版、flex 排版、grid 排版
- 根据 css 属性来进行排版
- 案例中只处理 flex 布局排版
- 分行算法：把元素分进“行”（hang）
- 若主轴设置 no-wrap 则强行分配进第一行
- 根据布局属性计算出每个元素的具体位置（宽高、以及 left top）
- 模拟采用 [images](https://www.npmjs.com/package/images) 这个库来渲染

```js
let viewport = images(800,600);
let img = images(element.style.width, element.style.height)
img.fill(rgba)// 使用 rgba 格式填充颜色，red, green, blue[, alpha]

viewport.draw(img, left, top)
viewport.save('imageName.jpg');
```


# week04

 production（产生式）：一步一步去定义一门语言的基础设施（工具/方法）；

## 产生式

1. Symbol: 定义语法的结构名称
2. Terminal Symbol ： 可以理解为叶子节点，最小的明确的不可拆分的结构
3. Non-Terminal Symbol： 由其他 Symbol 组成，可递归
4. 语言定义：Non-Terminal Symbol 由哪些 Symbol 组成，其中的 Non-Terminal Symbol 还可以逐层拆分，直至到 Terminal Symbol；
5. 语法树：把一段具体的语言的文本，根据产生式以树形结构表示出来；

### 产生式具体的写法

- BNF（Backus Normal Form 巴科斯-诺尔范式）一个美国人 Backus 和一个丹麦人 Normal 合作发明；
- 

# week05 - week12

busy with interview, not continue studying, but now i'll fighting to catch the goal!

# 组件化

前端架构：
1. 组件化（更重要）：好的组件化提高代码复用率
2. 架构模式： MVC、MVVM 关心前端和数据逻辑层是如何交互的

组件是一种 UI 强相关的模块，或是特殊的对象
- Properties (JS code) 强调从属关系 面向对象
- methods
- inherit
- attribute (markup code) 强调描述性 xml
- config & state
- event
- lifecycle
- children

## jsx

基于 babel-transform-react-plugin 手动实现 createElement 支持 jsx 写法；

1. 支持基本 html 自由 type 类型节点，class、textNode
2. 支持自定义类组件