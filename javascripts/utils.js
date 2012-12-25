var utils = {
  deepCopy: function (obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  equals: function (obj1, obj2) {
    return JSON.stringify(obj1) == JSON.stringify(obj2);
  }
};