TalkingHeads.module('Router', function(Router, TalkingHeads) {
  'use strict';

  Router.Main = Backbone.Router.extend({

    routes: {
      '': 'mostVocal',
      'most-vocal(/:filters)': 'mostVocal',
      'least-vocal(/:filters)': 'leastVocal',
      'most-interjections(/:filters)': 'mostInterjections'
    },

    initialize: function(options) {
      this.collection = options.collection;
    },

    mostVocal: function() {
      this.collection.sortByMostVocal();
    },

    leastVocal: function() {
      this.collection.sortByLeastVocal();
    },

    mostInterjections: function() {
      this.collection.sortByMostInterjections();
    }

  });

  TalkingHeads.router = new Router.Main({ collection: TalkingHeads.members });

});
