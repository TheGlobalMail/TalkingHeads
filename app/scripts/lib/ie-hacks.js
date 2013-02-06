if (!Element.prototype.addEventListener) {
    document.addEventListener = window.addEventListener = Element.prototype.addEventListener = function(type, fn, bubble) {
        var obj = this;
        this[type + fn] = function(e) {
            e = e || window.event;
            e.preventDefault  = e.preventDefault  || function() { e.returnValue = false; }
            e.stopPropagation = e.stopPropagation || function() { e.cancelBubble = true; }
            fn.call(obj, e);
        };
        return this.attachEvent("on" + type, this[type + fn]);
    };

    document.addEventListener = window.removeEventListener = Element.prototype.removeEventListener = function(type, fn) {
        var result = this.detachEvent("on" + type, this[type + fn]);
        this[type + fn] = null;
        return result;
    };
}
