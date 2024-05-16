/**
 * Сравнивает объекты в массивах `source` и `target` по свойству `field`. Возвращает три массива:
 * - совпадающие значения (присутствуют в обоих массивах);
 * - добавленные значения (присутствуют в `source`, отсутствуют в `target`);
 * - удалённые значения (отсутствуют в `source`, присутствуют в `target`).
 * @param {array} source Исходный массив объектов
 * @param {array} target Целевой массив объектов, с которым происходит сравнение
 * @param {string} field Свойство, по которому сравниваются объекты в массивах
 * @returns {[existingValues: array, addedValues: array, removedValues: array]}
 */
exports.differenceBy = (source, target, field) => {
  const sourceHashTable = Object.fromEntries(source.map((item) => [item[field], item]));
  const targetHashTable = Object.fromEntries(target.map((item) => [item[field], item]));

  const existingValues = [];
  const addedValues = [];
  const removedValues = [];

  source.forEach((item) => sourceHashTable[item[field]] && targetHashTable[item[field]] && existingValues.push(item));
  source.forEach((item) => sourceHashTable[item[field]] && !targetHashTable[item[field]] && addedValues.push(item));
  target.forEach((item) => !sourceHashTable[item[field]] && targetHashTable[item[field]] && removedValues.push(item));

  return [existingValues, addedValues, removedValues];
};
