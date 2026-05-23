import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { createServer } from 'node:http';

const root = join(process.cwd(), 'dist');
const port = Number(process.env.PORT || 4173);

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
};

function resolvePath(urlPath) {
  const pathname = new URL(urlPath, 'http://localhost').pathname;
  const cleanPath = normalize(decodeURIComponent(pathname))
    .replace(/^([/\\])+/, '')
    .replace(/^(\.\.[/\\])+/, '');
  const requested = join(root, cleanPath);

  if (existsSync(requested) && statSync(requested).isFile()) {
    return requested;
  }

  return join(root, 'index.html');
}

createServer((request, response) => {
  const filePath = resolvePath(request.url || '/');
  const contentType = mimeTypes[extname(filePath)] || 'application/octet-stream';

  response.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': filePath.endsWith('index.html') ? 'no-cache' : 'public, max-age=31536000, immutable',
  });

  createReadStream(filePath).pipe(response);
}).listen(port, '0.0.0.0', () => {
  console.log(`Try-on app is running on port ${port}`);
});
