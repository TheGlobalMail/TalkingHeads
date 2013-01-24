TalkingHeads.module('Views', function(Views, TalkingHeads, Backbone) {
  'use strict';

  Views.BubbleChart = Backbone.View.extend({

    initialize: function() {
      this.bubbleChart = new BubbleChart(this.el);
      this.listenTo(this.collection, 'sort', this.render, this);
    },

    render: function() {
      this.bubbleChart
        .set('valueAttribute', this.collection.sortAttribute)
        .setData(this.collection.toJSON())
        .render();
    }

  });


  // Views for Year/House dropdown filters
  Views.DropdownFilter = Backbone.View.extend({

    events: {
      'selectr:change': 'onSelect'
    },

    initialize: function() {
      this.$el.selectr();
    },

    onSelect: function(e, value) {
      TalkingHeads.vent.trigger('filter:' + this.options.eventName, value, e);
    }

  });

  Views.PartyFilters = Backbone.View.extend({

    events: {
      'change input': 'onChange'
    },

    onChange: function(e) {
      TalkingHeads.vent.trigger('filter:party', e.currentTarget.value, e.currentTarget.checked);
    }
  });

  TalkingHeads.addInitializer(function() {
    TalkingHeads.views.bubbleChart = new Views.BubbleChart({
      el: $('#bubble-chart'),
      collection: TalkingHeads.members
    });

    new Views.DropdownFilter({ el: $('#filter-year'), eventName: 'year' });
    new Views.DropdownFilter({ el: $('#filter-house'), eventName: 'house' });

    new Views.PartyFilters({ el: $('#filter-party') });
  });
});
