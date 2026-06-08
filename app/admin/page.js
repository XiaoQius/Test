'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';


function getStorageMessage(storageMode) {
  if (storageMode === 'redis') {
    return '当前使用 Redis/KV 持久化存储，适合 Vercel 部署。';
  }

  if (storageMode === 'vercel-readonly') {
    return '当前是 Vercel 只读模式：请绑定 Redis/KV 存储后再保存后台内容。';
  }

  return '当前使用本地 JSON 文件存储。默认本地后台令牌为 demo-admin-token，请在生产环境设置 ADMIN_TOKEN。';
}

const blankProfile = {
  name: '',
  initials: '',
  role: '',
  headline: '',
  summary: '',
  email: '',
  about: '',
  stats: [],
  projects: [],
  skills: [],
};

export default function AdminPage() {
  const [profile, setProfile] = useState(blankProfile);
  const [token, setToken] = useState('');
  const [status, setStatus] = useState('正在加载内容...');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const response = await fetch('/api/profile');
      const result = await response.json();
      setProfile(result.profile);
      setStatus(getStorageMessage(result.storageMode));
    }

    loadProfile().catch(() => setStatus('加载失败，请检查服务是否正常运行。'));
  }, []);

  const skillsText = useMemo(() => profile.skills.join('，'), [profile.skills]);

  function updateField(field, value) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  function updateStat(index, field, value) {
    setProfile((current) => ({
      ...current,
      stats: current.stats.map((stat, statIndex) => (statIndex === index ? { ...stat, [field]: value } : stat)),
    }));
  }

  function updateProject(index, field, value) {
    setProfile((current) => ({
      ...current,
      projects: current.projects.map((project, projectIndex) =>
        projectIndex === index ? { ...project, [field]: value } : project,
      ),
    }));
  }

  async function saveContent(event) {
    event.preventDefault();
    setIsSaving(true);
    setStatus('正在保存...');

    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token,
      },
      body: JSON.stringify(profile),
    });

    const result = await response.json();
    setIsSaving(false);
    setStatus(response.ok ? `保存成功，刷新首页即可看到最新内容。${getStorageMessage(result.storageMode)}` : result.message);
  }

  return (
    <main className="admin-shell">
      <section className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <p className="eyebrow">Admin</p>
            <h1>个人主页后台</h1>
            <p>在这里编辑首页内容，并通过 Next.js API 保存到服务器端 JSON 数据文件。</p>
          </div>
          <Link className="button button--ghost" href="/">
            返回首页
          </Link>
        </div>

        <form className="admin-form" onSubmit={saveContent}>
          <label>
            后台令牌
            <input value={token} onChange={(event) => setToken(event.target.value)} placeholder="demo-admin-token" />
          </label>

          <div className="form-grid">
            <label>
              姓名
              <input value={profile.name} onChange={(event) => updateField('name', event.target.value)} />
            </label>
            <label>
              缩写
              <input value={profile.initials} onChange={(event) => updateField('initials', event.target.value)} />
            </label>
            <label>
              邮箱
              <input type="email" value={profile.email} onChange={(event) => updateField('email', event.target.value)} />
            </label>
            <label>
              身份标签
              <input value={profile.role} onChange={(event) => updateField('role', event.target.value)} />
            </label>
          </div>

          <label>
            首页标题
            <input value={profile.headline} onChange={(event) => updateField('headline', event.target.value)} />
          </label>
          <label>
            首页简介
            <textarea value={profile.summary} onChange={(event) => updateField('summary', event.target.value)} rows={3} />
          </label>
          <label>
            关于我
            <textarea value={profile.about} onChange={(event) => updateField('about', event.target.value)} rows={4} />
          </label>

          <fieldset>
            <legend>统计信息</legend>
            {profile.stats.map((stat, index) => (
              <div className="form-grid" key={`stat-${index}`}>
                <label>
                  数值
                  <input value={stat.value} onChange={(event) => updateStat(index, 'value', event.target.value)} />
                </label>
                <label>
                  标签
                  <input value={stat.label} onChange={(event) => updateStat(index, 'label', event.target.value)} />
                </label>
              </div>
            ))}
          </fieldset>

          <fieldset>
            <legend>精选项目</legend>
            {profile.projects.map((project, index) => (
              <div className="project-editor" key={`project-${index}`}>
                <label>
                  标签
                  <input value={project.tag} onChange={(event) => updateProject(index, 'tag', event.target.value)} />
                </label>
                <label>
                  标题
                  <input value={project.title} onChange={(event) => updateProject(index, 'title', event.target.value)} />
                </label>
                <label>
                  描述
                  <textarea
                    value={project.description}
                    onChange={(event) => updateProject(index, 'description', event.target.value)}
                    rows={3}
                  />
                </label>
              </div>
            ))}
          </fieldset>

          <label>
            技能（用中文逗号或英文逗号分隔）
            <input
              value={skillsText}
              onChange={(event) =>
                updateField(
                  'skills',
                  event.target.value
                    .split(/[，,]/)
                    .map((skill) => skill.trim())
                    .filter(Boolean),
                )
              }
            />
          </label>

          <div className="admin-actions">
            <button className="button button--primary" type="submit" disabled={isSaving}>
              {isSaving ? '保存中...' : '保存内容'}
            </button>
            <p role="status">{status}</p>
          </div>
        </form>
      </section>
    </main>
  );
}
