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
      var key = pair, value = '';

      if (pair.indexOf(settings.keyValueDelimiter) !== -1) {
        pair  = pair.split(settings.keyValueDelimiter);
        key   = pair[0];
        value = decodeURI(pair[1]).split(settings.arrayValueDelimiter);

        if (value.length === 1) {
          value = value[0];
        }
      }

      params[key] = value;
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
