# Roomix Demo

香港找室友版 Tinder 的手机网页演示。纯静态站（Vite + React + Motion），无后端。

## 本地运行

```bash
npm install
npm run dev        # 手机和电脑在同一 Wi-Fi 时，用终端打印的 Network 地址在手机上打开
```

## 部署到 Cloudflare

二选一：

```bash
# A. Workers（静态资源），配置见 wrangler.jsonc
npx wrangler login
npm run deploy

# B. Pages
npm run build
npx wrangler pages deploy dist --project-name roomix-demo
```

在 Cloudflare 后台连接 Git 仓库也可以：构建命令 `npm run build`，输出目录 `dist`。

## 演示流程

1. 欢迎页右上角切换 简 / 繁 / EN（会记住选择）
2. 回答 10 题（右上角「跳过」可直接用示例答案）→ 生成你的卡片
3. 室友卡组：拖动 / 按钮滑卡；点照片左右切换照片，点卡片下部打开详情
   - **Kaylee（第 2 张）、Marcus、Ethan、Daniel** 会和你配对
4. 配对页点「一起刷房」→ 两人共享房源卡组（对方的选择是模拟的）
   - **西营盘、湾仔、旺角、上环** 这四间对方会喜欢 → 房源配对
5. 「消息」页可以聊天（对方会自动回复一次）；「我的」页可切换语言、重置演示

电脑演示时可用键盘：← 不要、→ 喜欢、↑ 超级喜欢、Backspace 撤回。

## 替换照片

1. 把原图（任意尺寸）放进 `photos-src/`（这个文件夹不会被部署）
2. 在 [src/data/photos.ts](src/data/photos.ts) 里把对应的值改成 `'src:文件名.jpg'`
3. 运行 `python scripts/photos.py`（需要 `pip install pillow`）：
   自动裁成竖图，压缩成两个尺寸的 WebP 放到 `public/photos/`，并更新版本号让浏览器拿到新图
4. `npm run deploy`

人物和房源的文字资料在 [src/data/people.ts](src/data/people.ts) 和 [src/data/rooms.ts](src/data/rooms.ts)；
10 道题在 [src/data/questions.ts](src/data/questions.ts)；界面文案在 [src/i18n.tsx](src/i18n.tsx)。

## 介绍视频

成片在 `video/out/`，四支（每支 80 秒，1080p / 30fps，含音乐音效）：

| 文件 | 用途 |
| --- | --- |
| `roomix-intro-16x9.mp4` | 英文 · 路演 / 投影 |
| `roomix-intro-9x16.mp4` | 英文 · 社交媒体 |
| `roomix-intro-zh-16x9.mp4` | 简体中文 · 路演 / 投影 |
| `roomix-intro-zh-9x16.mp4` | 简体中文 · 社交媒体 |

重新生成（改了 App 或文案后）：

```bash
npm run build          # 视频里嵌的是 dist/ 里的真实 App
node video/build.mjs   # 四支全部重出，约 12 分钟
```

只出一支、或先看静帧：

```bash
node video/render.mjs h --lang=zh --ui=sc                            # 只渲染横版中文（无声）
node video/render.mjs v --lang=zh --ui=sc --stills 2.6,29.2,65.6     # 出几张静帧检查
python video/audio.py zh
ffmpeg -y -i video/out/video-zh-h.mp4 -i video/out/audio-zh.wav -c:v copy -c:a aac -shortest video/out/roomix-intro-zh-16x9.mp4
```

- 字幕和画面时间线：[video/film/film.js](video/film/film.js)（`EN` / `ZH` 两套台词，`TXT` 是群聊、结尾标语等画面文字）
- App 内的点击和滑动时间点：[video/render.mjs](video/render.mjs) 的 `ACTIONS` / `SFX`
- 音乐音效：[video/audio.py](video/audio.py)（需要 `pip install numpy scipy pillow`）
