import QRCode from "qrcode";

export async function createQrDataUrl(value: string, size = 1024): Promise<string> {
  if (!value.trim()) throw new Error("QR value is required.");
  if (!Number.isInteger(size) || size < 128 || size > 4096) {
    throw new Error("QR size must be an integer between 128 and 4096.");
  }

  return QRCode.toDataURL(value, {
    width: size,
    margin: 2,
    errorCorrectionLevel: "H",
    type: "image/png",
    color: {
      dark: "#111111",
      light: "#ffffff",
    },
  });
}
