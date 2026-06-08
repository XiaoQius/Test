import Link from 'next/link';
import { getProfile } from '@/lib/profile';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const profile = await getProfile();

  return (
    <div className="page-shell">
      <header className="site-header">
        <Link className="brand" href="#top" aria-label="回到首页">
          {profile.initials}
        </Link>
        <nav className="nav" aria-label="主导航">
          <a href="#about">关于我</a>
          <a href="#work">项目</a>
          <a href="#skills">技能</a>
          <a href="#contact">联系</a>
          <Link href="/admin">后台</Link>
        </nav>
      </header>

      <main id="top">
        <section className="hero section-card" aria-labelledby="hero-title">
          <div className="hero__content">
            <p className="eyebrow">{profile.role}</p>
            <h1 id="hero-title">{profile.headline}</h1>
            <p className="hero__summary">{profile.summary}</p>
            <div className="hero__actions">
              <a className="button button--primary" href="#work">
                查看作品
              </a>
              <a className="button button--ghost" href={`mailto:${profile.email}`}>
                给我写信
              </a>
            </div>
          </div>
          <div className="profile-card" aria-label="个人信息卡片">
            <div className="avatar" aria-hidden="true">
              {profile.initials.slice(0, 1)}
            </div>
            <p className="profile-card__name">{profile.name}</p>
            <p className="profile-card__role">Full-stack Builder</p>
            <div className="profile-card__stats">
              {profile.stats.map((item) => (
                <span key={`${item.value}-${item.label}`}>
                  <strong>{item.value}</strong> {item.label}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="section-card split-section" aria-labelledby="about-title">
          <div>
            <p className="eyebrow">About</p>
            <h2 id="about-title">关于我</h2>
          </div>
          <p>{profile.about}</p>
        </section>

        <section id="work" className="section" aria-labelledby="work-title">
          <div className="section-heading">
            <p className="eyebrow">Selected Work</p>
            <h2 id="work-title">精选项目</h2>
          </div>
          <div className="project-grid">
            {profile.projects.map((project) => (
              <article className="project-card" key={project.title}>
                <span className="project-card__tag">{project.tag}</span>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="skills" className="section-card" aria-labelledby="skills-title">
          <div className="section-heading">
            <p className="eyebrow">Skills</p>
            <h2 id="skills-title">我常用的能力</h2>
          </div>
          <ul className="skill-list">
            {profile.skills.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        </section>

        <section id="contact" className="contact section-card" aria-labelledby="contact-title">
          <p className="eyebrow">Contact</p>
          <h2 id="contact-title">有想法想聊聊？</h2>
          <p>欢迎联系我合作产品、网站或自动化工具，也可以只是交换一本最近读到的好书。</p>
          <a className="button button--primary" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
        </section>
      </main>
    </div>
  );
}
