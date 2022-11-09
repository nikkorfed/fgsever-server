const { Op } = require("sequelize");
const _ = require("lodash");

exports.parseSorting = ({ sort = "id", order = "desc" }) => {
  const fields = sort.split(",").map((field) => [field, order.toUpperCase()]);

  const sortedById = fields.some(([field]) => field === "id");
  if (!sortedById) fields.push(["id", order.toUpperCase()]);

  return { order: fields };
};

exports.parseFilters = (query, config) => {
  const { searchField } = config;
  const where = {};

  if (query.q) {
    if (searchField) where[searchField] = { [Op.iLike]: `%${query.q}%` };
    delete query.q;
  }

  for (let field in query) where[field.includes(".") ? `$${field}$` : field] = query[field];

  return { where };
};

exports.parsePagination = ({ limit = 10, page, before, after }) => {
  const offset = page ? +limit * (page - 1) : undefined;
  return { limit: +limit, offset, before, after };
};

exports.parse = ({ sort, order, limit, page, before, after, ...query }, config = {}) => {
  const sorting = exports.parseSorting({ sort, order });
  const filters = exports.parseFilters(query, config);
  const pagination = exports.parsePagination({ limit, page, before, after });

  return { ...sorting, ...filters, ...pagination };
};
