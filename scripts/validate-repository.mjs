import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const ignoredDirectories = new Set(['.git', '.next', 'node_modules']);
const conflictMarkerPattern = /^(<<<<<<<|=======|>>>>>>>)\b/m;
const syntaxCheckFiles = [
  'lib/profile.js',
  'app/api/profile/route.js',
  'app/api/health/route.js',
  'next.config.mjs',
];

function readText(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function walkFiles(directory = root) {
  const entries = readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    const relativePath = path.relative(root, fullPath);

    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        files.push(...walkFiles(fullPath));
      }
      continue;
    }

    if (entry.isFile()) {
      files.push(relativePath);
    }
  }

  return files;
}

function assertNoConflictMarkers() {
  const checkedExtensions = new Set(['.css', '.js', '.json', '.md', '.mjs', '.txt']);
  const filesToCheck = walkFiles().filter((file) => {
    const extension = path.extname(file);
    return checkedExtensions.has(extension) || file === '.env.example' || file === '.gitignore';
  });

  const filesWithMarkers = filesToCheck.filter((file) => conflictMarkerPattern.test(readText(file)));

  if (filesWithMarkers.length > 0) {
    throw new Error(`发现未解决的 Git 冲突标记：${filesWithMarkers.join(', ')}`);
  }
}

function assertPackageJson() {
  const packageJson = JSON.parse(readText('package.json'));
  const requiredScripts = ['dev', 'build', 'start', 'check'];
  const requiredDependencies = ['next', 'react', 'react-dom'];

  for (const script of requiredScripts) {
    if (!packageJson.scripts?.[script]) {
      throw new Error(`package.json 缺少 scripts.${script}`);
    }
  }

  for (const dependency of requiredDependencies) {
    if (!packageJson.dependencies?.[dependency]) {
      throw new Error(`package.json 缺少 dependencies.${dependency}`);
    }
  }
}

function assertProfileJson() {
  const profile = JSON.parse(readText('data/profile.json'));
  const requiredFields = ['name', 'initials', 'role', 'headline', 'summary', 'email', 'about'];

  for (const field of requiredFields) {
    if (!profile[field]) {
      throw new Error(`data/profile.json 缺少 ${field}`);
    }
  }

  for (const arrayField of ['projects', 'skills', 'stats']) {
    if (!Array.isArray(profile[arrayField])) {
      throw new Error(`data/profile.json 的 ${arrayField} 必须是数组`);
    }
  }
}

function assertEnvExample() {
  const seenKeys = new Set();
  const duplicatedKeys = new Set();

  for (const line of readText('.env.example').split('\n')) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue;
    }

    const [key] = trimmedLine.split('=');

    if (seenKeys.has(key)) {
      duplicatedKeys.add(key);
    }

    seenKeys.add(key);
  }

  if (duplicatedKeys.size > 0) {
    throw new Error(`.env.example 存在重复变量：${[...duplicatedKeys].join(', ')}`);
  }
}

function assertSyntaxChecks() {
  for (const file of syntaxCheckFiles) {
    statSync(path.join(root, file));
    execFileSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  }
}

assertNoConflictMarkers();
assertPackageJson();
assertProfileJson();
assertEnvExample();
assertSyntaxChecks();

console.log('Repository validation passed.');
