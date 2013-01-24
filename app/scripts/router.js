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
      TalkingHeads.vent.trigger('chartMode', 'most-vocal');
    },

    leastVocal: function() {
      this.collection.sortByLeastVocal();
      TalkingHeads.vent.trigger('chartMode', 'least-vocal');
    },

    mostInterjections: function() {
      this.collection.sortByMostInterjections();
      TalkingHeads.vent.trigger('chartMode', 'most-interjections');
    }

  });

  TalkingHeads.router = new Router.Main({ collection: TalkingHeads.members });

});
