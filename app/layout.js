import './globals.css';

export const metadata = {
  title: '个人主页 | Alex Lin',
  description: 'Alex Lin 的个人主页：展示个人简介、精选项目、技能和联系方式。',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
