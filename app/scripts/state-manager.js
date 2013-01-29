(function(TalkingHeads, Marionette) {
  'use strict';
  var vent = TalkingHeads.vent;

  var StateManager = Marionette.Controller.extend({

    initialize: function() {
      this.filters = {};
      this.listen();
    },

    listen: function() {
      this.listenTo(vent, 'filter', this.onFilter, this);
    },

    onFilter: function(filter) {
      _.extend(this.filters, filter);
      vent.trigger('filters', this.filters);
    }

  });

  new StateManager();
}(TalkingHeads, Backbone.Marionette));
