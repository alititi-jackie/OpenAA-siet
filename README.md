# OpenAA 华人导航

这是 [openaa.com](https://openaa.com) 静态导航页，专为美国华人整理常用网站入口，包括政府服务、银行金融、购物海淘、DMV、地图、翻译、邮政、报税和生活工具等。

部署在 GitHub Pages，最终通过 **https://openaa.com** 访问。

---

## 文件结构

```
123638-site/
├── index.html              # 入口文件，页面主结构与 SEO
├── style.css               # 全部样式（移动端优先）
├── script.js               # 交互逻辑（轮播、分类切换、搜索过滤）
├── README.md               # 本文件
└── assets/
    ├── logo.png            # OpenAA logo（36×36，圆角）
    ├── favicon.ico         # 浏览器标签页图标
    ├── apple-touch-icon.png # iPhone 添加到主屏幕图标（180×180）
    └── ads/
        ├── ad-1.png        # 广告轮播图 1
        ├── ad-2.png        # 广告轮播图 2
        ├── ad-3.png        # 广告轮播图 3
        ├── ad-4.png        # 广告轮播图 4
        └── ad-5.png        # 广告轮播图 5
```

---

## 本地预览

无需服务器，直接用浏览器打开：

```bash
open index.html
# 或双击 index.html 在浏览器中打开
```

如需完整体验（包括图片懒加载），可用本地 HTTP 服务器：

```bash
# Python 3
python3 -m http.server 8080
# 然后访问 http://localhost:8080
```

---

## 如何替换广告图

1. 将新广告图片（推荐尺寸 **1500×500px**，PNG 或 JPG）命名为 `ad-1.png`~`ad-5.png`，放入 `assets/ads/` 目录，替换同名旧文件。
2. 如需修改广告跳转链接，打开 `script.js`，找到顶部的 `ADS` 数组，修改对应项的 `link` 字段：

```js
const ADS = [
  {
    image: 'assets/ads/ad-1.png',
    link: 'https://your-link-here.com',   // ← 修改这里
    alt: '广告描述'
  },
  // ...
]
```

> **注意**：链接必须使用完整绝对 URL（如 `https://app.openaa.com/jobs`），不要写 `/jobs` 这类相对路径。

---

## 如何修改导航网站

导航内容直接写在 `index.html` 的 `.nav-module` 区块中，每个 `.nav-card` 是一个链接单元：

```html
<a href="https://www.example.com" class="nav-card" target="_blank" rel="noopener">
  <div class="nav-card-icon" style="background:#e3f2fd"><span>🌐</span></div>
  <span class="nav-card-name">网站名称</span>
</a>
```

修改步骤：
- 修改 `href` 更换链接（必须用完整 URL）
- 修改 `<span>` 内的 Emoji 更换图标
- 修改 `nav-card-name` 内的文字更换名称

---

## 绝对 URL 规则

页面内所有跳出本静态导航页的链接，**必须使用完整绝对 URL**：

| ✅ 正确 | ❌ 错误 |
|---------|---------|
| `https://app.openaa.com/jobs` | `/jobs` |
| `https://openaa.com/nav/` | `nav/` |
| `https://www.amazon.com` | `amazon.com` |

---

## 占位图说明

以下图片为占位文件，可替换为真实图片：

- `assets/logo.png` — OpenAA logo，替换后页面顶部 logo 自动更新
- `assets/favicon.ico` — 浏览器标签页图标（16×16 或 32×32）
- `assets/apple-touch-icon.png` — iOS 主屏幕图标（180×180）
- `assets/ads/ad-1.png` ~ `ad-5.png` — 广告轮播图（推荐 1500×500）

---

## 分类 Tab 说明

| Tab | 显示模块 |
|-----|----------|
| 全部 | 回到推荐精选，显示所有模块 |
| 政府 | 定位到政府服务，所有模块仍可上下滑动查看 |
| 银行 | 定位到银行金融，所有模块仍可上下滑动查看 |
| 购物 | 定位到购物海淘，所有模块仍可上下滑动查看 |
| DMV | 定位到 DMV 常用，所有模块仍可上下滑动查看 |
| 常用AI | 定位到 AI 助手，所有模块仍可上下滑动查看 |

---

## AI 模块说明

AI 模块默认收录日常最常用的 AI 工具：ChatGPT、Claude、Gemini、Perplexity、Copilot、Meta AI、Grok、DeepSeek。

如需添加或替换，修改 `index.html` 中 `data-module="ai"` 的 `.nav-module` 区块内的 `.nav-card` 链接即可。

---

## 访问入口

- **正式地址**：https://openaa.com
- **GitHub Pages**：https://alititi-jackie.github.io/123638-site/（部署后可访问）
