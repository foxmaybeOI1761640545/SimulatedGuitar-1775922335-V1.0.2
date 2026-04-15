# Simulated Guitar

一个可本地运行的模拟吉他前端 Demo：
- 左手：按 `A` 循环切换和弦（默认 8 个常见和弦）
- 右手：按 `N M K J I O` 分别拨动 `6 -> 1` 弦
- 主页面仅保留演奏 UI，设置项隐藏并迁移到独立设置页
- 可在设置页自定义快捷键、调整和弦顺序、增减和弦组合
- 使用 `Tone.js` 生成拨弦声音

## 本地运行

```bash
npm install
npm run dev
```

打开终端输出的本地地址（默认 `http://localhost:5173`）。
在演奏页左上角点击菜单按钮可进入设置页。

## 构建

```bash
npm run build
npm run preview
```

## GitHub Pages

- 已内置 `GitHub Actions` 部署工作流，推送到 `main` 会自动构建并发布。
- 仓库名对应的访问地址为：
  `https://foxmaybeOI1761640545.github.io/SimulatedGuitar-1775922335-V1.0.1/`
