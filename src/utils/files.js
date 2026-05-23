export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function modelPoster(title = 'AR Model') {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="620" viewBox="0 0 900 620">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="#e9f4f2"/>
          <stop offset="1" stop-color="#f9eee9"/>
        </linearGradient>
      </defs>
      <rect width="900" height="620" fill="url(#g)"/>
      <g fill="none" stroke="#287d72" stroke-width="26" stroke-linejoin="round">
        <path d="M450 155 620 250v180L450 528 280 430V250l170-95Z"/>
        <path d="M280 250 450 348l170-98M450 348v180"/>
      </g>
      <text x="450" y="95" text-anchor="middle" font-family="Arial" font-size="48" font-weight="700" fill="#14202a">${title}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function splitModelByType(fileName, dataUrl) {
  const lowerName = fileName.toLowerCase();

  if (lowerName.endsWith('.usdz')) {
    return { iosModelData: dataUrl };
  }

  return { modelData: dataUrl };
}
