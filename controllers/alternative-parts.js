const { search } = require("~/services/alternative-parts");

exports.search = async (req, res) => {
  const { number } = req.params;

  if (!number) return res.send({ error: "no-part-number" });

  const parts = await search(number);
  if (!parts) return res.send({ error: "no-alternatives" });

  return res.send(parts);
};
