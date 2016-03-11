const imm = require('immutable');

let defaults = imm.Map({
  flex  : 1,
  size  : 150,
  sort  : false,
  fixed : false
});

/**
 * Creates a model that defines the rendering characteristics of a datafield from an api response.
 *
 * Fields contain the following keys:
 *  - name : The display name of the field.
 *  - field : The key of the data field within the api response. Use a dot for nested lookups, even arrays.
 *  - size=150 : The minimum width of the table column.
 *  - flex=1 : The flex-box value for the column. Use 0 for a statically sized column
 *  - fixed=false: If the column should remain in place when the table is scrolled horizontally.
 *  - sort='alpha': ('alpha'|'num'|'date'|false) Specifies which sorting method should be used for the column.
 *
 * @param args
 * @returns {"immutable".Map<K, V>|"immutable".Map<string, V>}
 */
module.exports = function(args) {
  return defaults.merge(args);
};
