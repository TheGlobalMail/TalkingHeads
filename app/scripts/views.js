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

  Views.ChartMode = Backbone.View.extend({

    initialize: function() {
      this.listenTo(TalkingHeads.vent, 'chartMode', this.onChartMode, this);
    },

    onChartMode: function(mode) {
      var $current = this.$('li.active');

      if ($current.hasClass(mode)) {
        return false;
      }

      $current.removeClass('active');
      this.$('.' + mode).addClass('active');
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

    initialize: function() {
      this.$labels = this.$('label');
      this.updateActive();
    },

    updateActive: function() {
      this.$labels.each(function() {
        var $label = $(this);
        var $checkbox = $label.find('input');
        if ($checkbox[0].checked) {
          $label.addClass('active');
        } else {
          $label.removeClass('active');
        }
      });
    },

    onChange: function(e) {
      var checkbox = e.currentTarget;
      this.updateActive();
      TalkingHeads.vent.trigger('filter:party', checkbox.value, checkbox.checked);
    }

  });

  TalkingHeads.addInitializer(function() {
    TalkingHeads.views.bubbleChart = new Views.BubbleChart({
      el: $('#bubble-chart'),
      collection: TalkingHeads.members
    });

    new Views.ChartMode({ el: $('#chart-modes') });

    new Views.DropdownFilter({ el: $('#filter-year'), eventName: 'year' });
    new Views.DropdownFilter({ el: $('#filter-house'), eventName: 'house' });

    new Views.PartyFilters({ el: $('#filter-party') });
  });
});
