const fs = require("fs/promises");

const QR_CODE_TIMEOUT = 5 * 60 * 1000; // 5 минут

const getCode = async () => {
  const qrCode = JSON.parse(await fs.readFile(__dirname + "/data/qr-code.json").catch(() => null));
  if (!qrCode) return {};

  return qrCode;
};

const setCode = async (data) => {
  const qrCode = { ...data, createdAt: new Date() };
  await fs.writeFile(__dirname + "/data/qr-code.json", JSON.stringify(qrCode, null, 2));

  return qrCode;
};

const checkCode = async () => {
  const qrCode = JSON.parse(await fs.readFile(__dirname + "/data/qr-code.json").catch(() => null));
  if (!qrCode?.createdAt) return;

  const qrCodeExpired = Date.now() - new Date(qrCode.createdAt) >= QR_CODE_TIMEOUT;
  if (!qrCodeExpired) return;

  await fs.writeFile(__dirname + "/data/qr-code.json", JSON.stringify({}, null, 2));
  console.log("[QR] Активный QR-код был удален!");
};

setInterval(checkCode, 5000);

module.exports = { getCode, setCode };
