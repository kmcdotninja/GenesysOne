import { QRCodeSVG } from 'qrcode.react'

/** Scannable QR for a passport's public URL, with the GenesysOne mark inset. */
export function PassportQR({ value, size = 208 }: { value: string; size?: number }) {
  return (
    <QRCodeSVG
      value={value}
      size={size}
      level="H"
      bgColor="#ffffff"
      fgColor="#023729"
      marginSize={1}
      imageSettings={{
        src: '/mark.svg',
        height: Math.round(size * 0.22),
        width: Math.round(size * 0.22),
        excavate: true,
      }}
    />
  )
}
