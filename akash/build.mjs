import fs from 'node:fs';
import esbuild from 'esbuild';

const watch = process.argv.includes('--watch');
fs.mkdirSync('dist', { recursive: true });

const walk = (d) =>
  fs.existsSync(d)
    ? fs
        .readdirSync(d, { withFileTypes: true })
        .flatMap((e) =>
          e.isDirectory() ? walk(d + '/' + e.name) : [d + '/' + e.name]
        )
    : [];

// Copy all static photos, images, and animation frames
const allAssets = [
  ...walk('photos'),
  ...walk('images'),
  ...walk('frames'),
].filter((f) => /\.(jpe?g|png|webp|avif|mp4|webm|svg)$/i.test(f));

for (const f of allAssets) {
  const norm = f.replace(/\\/g, '/');
  const target = 'dist/' + norm;
  fs.mkdirSync(target.slice(0, target.lastIndexOf('/')), { recursive: true });
  fs.copyFileSync(f, target);
}

const normAssets = allAssets.map((p) => p.replace(/\\/g, '/'));
console.log('static assets found: ' + normAssets.length);

const copy = () => {
  fs.copyFileSync('src/styles.css', 'dist/styles.css');
  fs.copyFileSync('index.html', 'dist/index.html');
  if (fs.existsSync('silk-reveal.html')) {
    fs.copyFileSync('silk-reveal.html', 'dist/silk-reveal.html');
  }
  if (fs.existsSync('video.mp4')) {
    fs.copyFileSync('video.mp4', 'dist/video.mp4');
  }
  fs.copyFileSync('src/styles.css', '../styles.css');
  fs.copyFileSync('index.html', '../index.html');
};

const syncRootApp = () => {
  if (fs.existsSync('dist/app.js')) {
    fs.copyFileSync('dist/app.js', '../app.js');
  }
};

const opts = {
  entryPoints: ['src/main.tsx'],
  bundle: true,
  outfile: 'dist/app.js',
  minify: !watch,
  sourcemap: watch,
  target: 'es2020',
  jsx: 'automatic',
  logLevel: 'info',
  define: {
    'process.env.NODE_ENV': '"production"',
    __PHOTOS__: JSON.stringify(normAssets),
  },
};

copy();

if (watch) {
  const ctx = await esbuild.context(opts);
  await ctx.watch();
  fs.watch('src/styles.css', () => { copy(); syncRootApp(); });
  console.log('watching...');
} else {
  await esbuild.build(opts);
  syncRootApp();
  console.log('build complete');
}
