const { getCode, setCode } = require("~/services/qr-code");

exports.get = async (req, res) => {
  const qrCode = await getCode();
  return res.send(qrCode);
};

exports.put = async (req, res) => {
  const qrCode = await setCode(req.body);
  return res.send(qrCode);
};
