# Next.js 个人主页 + 后台

这是一个使用 Next.js 编写的个人主页示例，包含首页展示和一个简单后台。

## 可行性判断

可以一键部署到 Vercel。Next.js 是 Vercel 原生支持的全栈框架，项目根目录已经包含 `package.json`、`next.config.mjs` 和 App Router 代码，Vercel 导入仓库后会自动识别并执行 `npm run build`。

需要注意：Vercel 的函数运行环境不适合把后台内容持久写入仓库里的 JSON 文件。因此本项目支持两种存储模式：

- 本地开发：后台保存到 `data/profile.json`。
- Vercel 部署：首页可以直接部署；如果要让后台保存内容长期生效，请在 Vercel Marketplace 绑定 Redis/KV 存储，让平台注入 `KV_REST_API_URL` 和 `KV_REST_API_TOKEN`。

## 一键部署到 Vercel

> 先把这个仓库推送到你自己的 GitHub / GitLab / Bitbucket 仓库，然后把下面链接里的 `YOUR_GIT_REPOSITORY_URL` 替换成你的仓库地址。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=YOUR_GIT_REPOSITORY_URL&env=ADMIN_TOKEN&envDescription=ADMIN_TOKEN%20is%20used%20to%20protect%20the%20admin%20save%20API.%20Use%20a%20long%20random%20value.)

部署时建议设置：

- `ADMIN_TOKEN`：后台保存接口的令牌，生产环境必须换成长随机字符串。
- `KV_REST_API_URL` / `KV_REST_API_TOKEN`：如果要在 Vercel 上持久保存后台修改，请从 Vercel Marketplace 绑定 Redis/KV 后自动注入。
- `PROFILE_KV_KEY`：可选，默认是 `profile`。

## 本地运行

```bash
npm install
npm run dev
```

然后访问：

- 首页：<http://localhost:3000>
- 后台：<http://localhost:3000/admin>

## 后台令牌

本地默认后台令牌是：

```text
demo-admin-token
```

生产环境请设置环境变量：

```bash
ADMIN_TOKEN="your-secure-token" npm run start
```

也可以复制 `.env.example` 为 `.env.local` 后填写自己的配置。

## API 与数据

- `GET /api/profile`：读取首页资料，并返回当前存储模式。
- `PUT /api/profile`：需要 `x-admin-token` 请求头；本地写入 `data/profile.json`，Vercel 上使用 Redis/KV 持久化。

## 说明

当前后台适合作为个人站点的轻量内容管理入口。如果需要正式生产使用，建议继续增加正式登录系统、图片上传、审计日志和更细粒度的权限管理。
