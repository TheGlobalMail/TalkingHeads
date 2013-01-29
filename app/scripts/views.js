TalkingHeads.module('Views', function(Views, TalkingHeads, Backbone) {
  'use strict';

  var kvParser = window.KeyValuePairParser;

  Views.BubbleChart = Backbone.View.extend({

    initialize: function() {
      this.bubbleChart = new BubbleChart(this.el);
      this.listenTo(this.collection, 'filter sort', this.render, this);
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
      this.$items = this.$('li a');
      this.listenTo(TalkingHeads.vent, 'chartMode', this.onChartMode, this);
      this.listenTo(TalkingHeads.vent, 'filters', this.setFilters, this);
    },

    onChartMode: function(mode) {
      var $current = this.$('li.active');

      if ($current.hasClass(mode)) {
        return false;
      }

      $current.removeClass('active');
      this.$('.' + mode).addClass('active');
    },

    setFilters: function(filters) {
      filters = kvParser.compile(filters);
      _.each(this.$items, function(el) {
        var mode = el.parentNode.className.split(' ')[0];
        el.href = '/' + mode + '/' + filters;
      }, this);
    }

  });


  // Views for Year/House dropdown filters
  Views.DropdownFilter = Backbone.View.extend({

    events: {
      'selectr:change': 'updateSelected'
    },

    initialize: function() {
      this.$el.selectr();
      this.updateSelected();
      this.listenTo(TalkingHeads.vent, 'filters', this.setFilters, this);
    },

    updateSelected: function() {
      var send = {};
      send[this.options.eventName] = this.$el.selectr().getValue();
      TalkingHeads.vent.trigger('filter', send);
    },

    setFilters: function(filters) {
      var selected = filters[this.options.eventName];
      this.$el.selectr().setSelected(selected, true);
    }

  });

  Views.PartyFilters = Backbone.View.extend({

    events: {
      'change input': 'updateActive'
    },

    initialize: function() {
      this.$labels = this.$('label');
      this.listenTo(TalkingHeads.vent, 'filters', this.setFilters, this);
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

      var $checked = this.$(':checked');
      var checked = [];

      $checked.each(function() {
        checked.push(this.value);
      });

      TalkingHeads.vent.trigger('filter', { 'party': checked });
    },

    setFilters: function(filters) {
      this.$labels.each(function() {
        var $label = $(this);
        var $checkbox = $label.find('input');
        var checked = _.contains(filters.party, $checkbox.val());
        $checkbox.prop('checked', checked);
        if (checked) {
          $label.addClass('active')
        } else {
          $label.removeClass('active');
        }
      });
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
