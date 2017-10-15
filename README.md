# CanvasTrace
在百度地图上使用canvas创建路线轨迹，可以方便的通过配置绘制出复杂样式的地图轨迹。
[示例传送门](https://brahmachen.github.io/CanvasLayer/trace-examples/trace.html)

## 开始使用
### 引入
```HTML
 <script type="text/javascript" src="CanvasTrace.js"></script>
```
### 使用
```JavaScript
var canvasTrace = new CanvasTrace(options)
```
### options 选项
| 属性      |    必填 |    含义 |
| :-------- | :--------| :--------|
|data       |是 |Array，轨迹数据，格式为`[{lat: 36,lng: 120},...]`
|map        |是 |Object，BMap的实例
|color      |否 |String，轨迹颜色，格式同`canvas`的`strokeStyle`，如`"red","rgba(50, 50, 255, 0.7)"`具体请看`canvas`文档[strokeStyle](https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API/Tutorial/Applying_styles_and_colors)
|width      |否 |Number，轨迹线的宽度，同样，格式同`canvas`的`lineWidth`
|showArrow  |否，默认`false` |Boolean，是否显示轨迹线上的方向箭头，默认不显示


<!-- ### todo list

- 轨迹的颜色渐变。根据某个值（如速度）设置不同的颜色，并实现渐变效果；
- 动画。实现带有动画的方向箭头。 -->
### 示例 
[传送门](https://brahmachen.github.io/CanvasLayer/trace-examples/trace.html)
<!--[绘制正方形示例](http://huiyan-fe.github.io/CanvasLayer/examples/point.html) 
[绘制圆形动画示例](http://huiyan-fe.github.io/CanvasLayer/examples/animationcircle.html) -->
