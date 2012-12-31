function Observerable () {}

Observerable.prototype.addObserver = function (observer, context) {
  this.observers = this.observers || [];
  this.observers.push({block: observer, context: context || null});
};

Observerable.prototype.notifyObservers = function () {
  for (var i = 0; i < (this.observers || []).length; i++) {
    var observer = this.observers[i];
    observer.block.apply(observer.context, arguments);
  }
};

Observerable.mixin = function (target) {
  Object.keys(Observerable.prototype).forEach(function (property) {
    target[property] = Observerable.prototype[property];
  });
};