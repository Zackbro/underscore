(function () {

  var root = this;

  var previousUnderscore = root._;

  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  var push = ArrayProto.push,
      slice = ArrayProto.slice,
      toString = ObjProto.toString,
      hasOwnProperty = ObjProto.hasOwnProperty;

  var nativeIsArray = Array.isArray,
      nativeKeys = Object.keys,
      nativeBind = FuncProto.bind,
      nativeCreate = Object.create;

  var Ctor = function() {};

  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // 对回调的优化
  var optimizeCb = function (func, context, argCount) {
    if (context === void 0) return func;
    switch(argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value)
      };
      case 2: return function(value, other) {
        return func.call(context, value, other)
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection)
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    };
    return function() {
      return func.apply(context, arguments)
    };
  };

  var cb = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value)) return _.matcher(value);
    return _.property(value);
  }
  
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var isArrayLike = function(collection) {
    var length = collection != null && collection.length;
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  }

  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if(isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i<length; i++) {
        iteratee(obj[keys[i]], keys[i], obj)
      }
    }
  }

  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };


  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];  // 不是对象返回空数组
    if (nativeKeys) return nativeKeys(obj); // 一般都执行了这一步 ES5的
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    // if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  }


  // 判断是否是对象
  _.isObject = function (obj) {
    var type = typeof obj;
    // !!obj 为了NaN的情况，直接返回false
    return type === 'function' || type === 'object' && !!obj;

  }
  // 判断对象属性是否存在
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  }

  // 返回传入的参数
  _.identity = function(value) {
    return value;
  }

  // 判断是否是function
  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
    _.isFunction = function(obj) {
      return typeof obj = 'function' || false;
    }; 
  }

  // 判断对象是否有键值对
  _.matcher = _.matches = function(attrs) {
    attrs = _extendOwn({}, attrs);
    return function (obj) {
      return _.isMatch(obj, attrs);
    };
  }

  _.extendOwn = _.assign = createAssigner(_.keys);

}.call(this))