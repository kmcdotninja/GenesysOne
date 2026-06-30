import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { QRCodeSVG } from 'qrcode.react'
import { Logo, Mark } from '@/components/Logo'
import type { Passport } from '@/data/types'

/**
 * Builds a self-contained, branded HTML certificate for a verified passport and
 * triggers a download. The file opens in any browser and prints cleanly to PDF.
 */
export function downloadPassportCertificate(p: Passport) {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const publicUrl = `${origin}/passport/${p.number}`
  const gps = `${Math.abs(p.gps.lat).toFixed(4)}° ${p.gps.lat >= 0 ? 'N' : 'S'}, ${Math.abs(p.gps.lng).toFixed(4)}° ${p.gps.lng >= 0 ? 'E' : 'W'}`

  // GenesysOne marks, inlined so the downloaded file is self-contained.
  const markSvg = renderToStaticMarkup(createElement(Mark))
  const logoSvg = renderToStaticMarkup(createElement(Logo))
  // A coloured, data-URI copy of the mark to drop into the centre of the QR
  // (currentColor → a fixed green so it renders standalone, offline).
  const markDataUri = `data:image/svg+xml,${encodeURIComponent(markSvg.replace(/currentColor/g, '#0c5c43'))}`

  // Inline, offline-safe QR (no external request) pointing at the public passport,
  // with the logo mark embedded at the centre. Level "H" keeps it scannable.
  const qrSvg = renderToStaticMarkup(
    createElement(QRCodeSVG, {
      value: publicUrl,
      size: 132,
      level: 'H',
      bgColor: '#ffffff',
      fgColor: '#023729',
      marginSize: 0,
      imageSettings: { src: markDataUri, height: 30, width: 30, excavate: true },
    }),
  )

  const kv = (label: string, value: string) =>
    `<tr><td class="k">${label}</td><td class="v">${value}</td></tr>`
  const composition = (p.composition ?? [])
    .map((c) => `<tr><td class="k">${c.formula} · ${c.label}</td><td class="v">${c.value.toFixed(2)}%</td></tr>`)
    .join('')

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<title>GenesysOne Certificate — ${p.number}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,Segoe UI,Roboto,Inter,sans-serif;color:#1c3d31;background:#fbfbfa;padding:40px}
  .doc{max-width:780px;margin:0 auto;background:#fff;border:1px solid #ececea;border-radius:20px;overflow:hidden}
  .hero{background:#023729;color:#fff;padding:28px 32px;display:flex;align-items:center;gap:24px;flex-wrap:wrap}
  .qr{background:#fff;padding:12px;border-radius:16px;flex:none;text-align:center}
  .qr svg{display:block;width:132px;height:132px}
  .qr-cap{display:block;margin-top:8px;font-size:10px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#3d4f48}
  .hero-text{min-width:200px;flex:1}
  .brand-logo{display:block;color:#a6e64d;margin-bottom:14px}
  .brand-logo svg{height:26px;width:auto;display:block}
  .hero h1{font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#a6e64d}
  .hero h2{font-size:24px;margin-top:6px;letter-spacing:-.02em}
  .badge{display:inline-block;margin-top:14px;background:#a6e64d;color:#023729;font-weight:700;font-size:12px;padding:6px 12px;border-radius:999px}
  .num{font-family:ui-monospace,Menlo,monospace;margin-top:10px;color:rgba(255,255,255,.7);font-size:13px}
  .body{padding:28px 32px}
  h3{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#3d4f48;margin:22px 0 10px}
  table{width:100%;border-collapse:collapse;font-size:14px}
  td{padding:7px 0;border-bottom:1px solid #f1f1ef;vertical-align:top}
  .k{color:#3d4f48;width:46%}
  .v{color:#023729;font-weight:600;text-align:right}
  .anchor{margin-top:22px;background:#d8efe7;border-radius:14px;padding:14px 16px;font-size:13px;color:#06674c}
  .anchor b{display:block;margin-bottom:4px}
  .hash{font-family:ui-monospace,Menlo,monospace;font-size:11px;word-break:break-all;color:#3d4f48}
  .foot{padding:18px 32px;border-top:1px solid #ececea;font-size:12px;color:#566a62;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}
  a{color:#06674c}
</style></head>
<body><div class="doc">
  <div class="hero">
    <div class="qr">${qrSvg}<span class="qr-cap">Scan to verify</span></div>
    <div class="hero-text">
      <span class="brand-logo">${logoSvg}</span>
      <h1>Digital Mineral Passport</h1>
      <h2>${p.productName}</h2>
      <span class="badge">${p.status === 'verified' ? 'VERIFIED & AUTHENTIC' : p.status.replace('_', ' ').toUpperCase()}</span>
      <div class="num">${p.number}</div>
    </div>
  </div>
  <div class="body">
    <h3>Product</h3>
    <table>
      ${kv('Mineral', p.productName)}
      ${kv('Grade', p.gradeLabel)}
      ${kv('Quantity', `${p.quantity} ${p.unit === 'ton' ? 'MT' : p.unit}`)}
      ${kv('Batch number', p.batchId ?? '—')}
      ${kv('Mining method', p.miningMethod ?? '—')}
    </table>

    <h3>Origin &amp; provenance</h3>
    <table>
      ${kv('Mine site', p.siteName)}
      ${kv('Region', `${p.region}, ${p.country}`)}
      ${kv('GPS', gps)}
      ${kv('Producer', p.seller)}
      ${p.verifiedAt ? kv('Verified on', p.verifiedAt) : ''}
    </table>

    ${p.esg ? `<h3>ESG &amp; sustainability</h3><table>${kv('Overall ESG score', `${p.esg.overall}%`)}${kv('Environmental', `${p.esg.environmental}%`)}${kv('Social', `${p.esg.social}%`)}${kv('Governance', `${p.esg.governance}%`)}${kv('Supply chain', `${p.esg.supplyChain}%`)}</table>` : ''}

    ${composition ? `<h3>Lab composition</h3><table>${composition}</table>` : ''}

    ${p.txHash ? `<div class="anchor"><b>Blockchain anchor · ${p.chain}</b><span class="hash">${p.txHash}</span><div style="margin-top:6px">Anchored ${p.anchoredAt ?? ''} · immutable &amp; tamper-evident</div></div>` : ''}
  </div>
  <div class="foot">
    <span>Verify online: <a href="${publicUrl}">${publicUrl}</a></span>
    <span>© ${new Date().getFullYear()} GenesysOne</span>
  </div>
</div></body></html>`

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `GenesysOne-Passport-${p.number}.html`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
