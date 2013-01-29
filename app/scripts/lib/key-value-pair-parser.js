(function(_) {
  'use strict';

  var KeyValuePairParser = {};

  var settings = KeyValuePairParser.settings = {
    pairDelimiter: '+',
    keyValueDelimiter: ':',
    arrayValueDelimiter: ','
  };

  KeyValuePairParser.parse = function(segment) {
    var pairs = segment.split(settings.pairDelimiter);
    var params = {};

    _.each(pairs, function(pair) {
      pair = pair.split(settings.keyValueDelimiter);
      var key = pair[0];
      var value = pair[1].split(settings.arrayValueDelimiter);
      if (value.length === 1) {
        value = value[0];
      }

      params[key] = decodeURI(value);
    });

    return params;
  };

  KeyValuePairParser.compile = function(object) {
    var pairs = [];

    _.each(object, function(value, key) {
      if (_.isArray(value)) {
        value = value.join(settings.arrayValueDelimiter);
      }
      pairs.push(key + settings.keyValueDelimiter + value);
    });

    return pairs.join(settings.pairDelimiter);
  };

  window.KeyValuePairParser = KeyValuePairParser;
}(_));
