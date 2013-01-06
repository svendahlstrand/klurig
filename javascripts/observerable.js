function Observerable () {}

Observerable.prototype.addObserver = function (type, observer, context) {
  this.observers = this.observers || [];
  this.observers.push({ type: type, block: observer, context: context || null });
};

Observerable.prototype.notifyObservers = function (type) {
  this.observers.forEach(function (observer) {
    if (type == observer.type) {
      observer.block.apply(observer.context);
    }
  });
};

Observerable.mixin = function (target) {
  Object.keys(Observerable.prototype).forEach(function (property) {
    target[property] = Observerable.prototype[property];
  });
};