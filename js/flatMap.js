Array.prototype.flatMap = function(lambda) {
    return [].concat(this.map(lambda));
};
