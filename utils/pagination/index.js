const _ = require("lodash");
const { Op, parseCursor, createCursor, normalizeOrder, getPaginationQuery, reverseOrder } = require("./utils");

const withPagination = (Model, options) => {
  const { methodName = "paginate", primaryKeyField = "guid", findAll = Model.findAll, count = Model.count } = options ?? {};

  const paginate = async function ({ order: orderOption, where, after, before, limit, include, ...queryArgs } = {}) {
    let order = normalizeOrder(orderOption, primaryKeyField);

    order = before ? reverseOrder(order) : order;

    const cursor = after ? parseCursor(after) : before ? parseCursor(before) : null;

    const paginationQuery = cursor ? getPaginationQuery(order, cursor) : null;

    const paginationWhere = paginationQuery ? { [Op.and]: [paginationQuery, where] } : where;

    const paginationQueryOptions = {
      where: paginationWhere,
      include,
      limit,
      order,
      ...queryArgs,
    };

    const totalCountQueryOptions = {
      where,
      distinct: true,
      ...queryArgs,
    };

    const cursorCountQueryOptions = {
      where: paginationWhere,
      distinct: true,
      ...queryArgs,
    };

    const [instances, totalCount, cursorCount] = await Promise.all([
      findAll.call(this, paginationQueryOptions),
      count.call(this, totalCountQueryOptions),
      count.call(this, cursorCountQueryOptions),
    ]);

    if (before) {
      instances.reverse();
    }

    const remaining = cursorCount - instances.length;

    const hasNextPage = (!before && remaining > 0) || (Boolean(before) && totalCount - cursorCount > 0);
    const hasPreviousPage = (Boolean(before) && remaining > 0) || (!before && totalCount - cursorCount > 0);

    const cursors = {
      start: instances.length > 0 ? createCursor(instances[0], order) : null,
      end: instances.length > 0 ? createCursor(instances[instances.length - 1], order) : null,
    };

    return {
      count: totalCount,
      cursors: {
        before: hasPreviousPage ? cursors.start : undefined,
        after: hasNextPage ? cursors.end : undefined,
      },
      results: instances,
    };
  };

  Model[methodName] = paginate;

  return Model;
};

module.exports = withPagination;
