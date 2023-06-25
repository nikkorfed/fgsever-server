const upload = require("express-fileupload");

module.exports = upload({ createParentPath: true });
