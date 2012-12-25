var utils = {
  // Makes a deep copy (clone) of an object.
  deepCopy: function (obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  // Returns true if two objects represents the same data.
  equals: function (obj1, obj2) {
    return JSON.stringify(obj1) == JSON.stringify(obj2);
  }
};