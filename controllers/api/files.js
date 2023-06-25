const { files } = require("~/services/api");

exports.upload = async (req, res, next) => {
  const { file } = req.files;

  const result = await files.upload(file, req.query);
  return res.json(result);
};
