const path = require("path");

const DOMAIN_URL = process.env.DOMAIN_URL;

exports.upload = async (file, options = {}) => {
  const filename = (options.name ?? Date.now()) + path.extname(file.name);
  const filepath = options.path ?? "/";
  const destination = path.normalize(`public/${filepath}/${filename}`);

  await file.mv(destination);

  return { url: destination.replace("public", DOMAIN_URL + "/static") };
};
