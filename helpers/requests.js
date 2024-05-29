const { chunk } = require("lodash");

exports.chunkRequest = (request) => async (filterValues) => {
  const filterChunks = chunk(filterValues, 50);

  const requests = filterChunks.map((chunk) => request(chunk));
  const responses = await Promise.all(requests);

  return [].concat(...responses);
};
