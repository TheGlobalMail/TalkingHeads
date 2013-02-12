TalkingHeads.module('Router', function(Router, TalkingHeads) {
  'use strict';

  var kvParser = window.KeyValuePairParser;

  Router.Main = Backbone.Router.extend({

    routes: {
      '': 'index',
      'most-vocal(/*filters)': 'mostVocal',
      'least-vocal(/*filters)': 'leastVocal',
      'most-interjections(/*filters)': 'mostInterjections'
    },

    initialize: function(options) {
      this.collection = options.collection;
      this.listenTo(TalkingHeads.vent, 'filters', this._setFilters, this);
    },

    index: function() {
      this.navigate('/most-vocal', { replace: true });
      this.mostVocal();
    },

    mostVocal: function(filters) {
      this._setMode('most-vocal');
      this._processFilters(filters);
      this.collection.sortByMostVocal();
    },

    leastVocal: function(filters) {
      this._setMode('least-vocal');
      this._processFilters(filters);
      this.collection.sortByLeastVocal();
    },

    mostInterjections: function(filters) {
      this._setMode('most-interjections');
      this._processFilters(filters);
      this.collection.sortByMostInterjections();
    },

    _setFilters: function(filters) {
      filters = kvParser.compile(filters);
      this.navigate('/' + this.mode + '/' + filters);
      TalkingHeads.vent.trigger('route');
    },

    _processFilters: function(filters) {
      if (filters) {
        // strip slashes (namely trailing slashes)
        filters = kvParser.parse(filters.replace('/', ''));

        if ('house' in filters) {
          filters.house = parseInt(filters.house, 10);
        }

        // party should always be an array
        if (_.has(filters, 'party') && !_.isArray(filters.party)) {
          if (filters.party) {
            // single non-empty value
            filters.party = [filters.party];
          } else {
            // empty value
            filters.party = [];
          }
        }

        TalkingHeads.vent.trigger('filter', filters);
      }
    },

    _setMode: function(mode) {
      this.mode = mode;
      TalkingHeads.vent.trigger('chartMode', this.mode);
    }

  });

  TalkingHeads.router = new Router.Main({ collection: TalkingHeads.members });

});
