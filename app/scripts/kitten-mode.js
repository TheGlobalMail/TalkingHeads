(function(Backbone, $) {
  'use strict';

  var KittenMode = Backbone.View.extend({

    events: {
      'change :checkbox': 'toggleKittenMode'
    },

    initialize: function() {
      _.bindAll(this);
      this.$chart = $('#bubble-chart');
      this.listenTo(TalkingHeads.vent, 'chartRendered', this.onChartRendered, this);
    },

    onChartRendered: function(noData) {
      this.noData = noData;
      this.toggleKittenMode();
    },

    toggleKittenMode: function() {
      if (this.isChecked() && !this.noData) {
        return this._showKittenMode();
      }
      return this._hideKittenMode();
    },

    isChecked: function() {
      return this.$(':checkbox').is(':checked');
    },

    _showKittenMode: function() {
      this.$bubbles = this.$chart.find('.bubble');

      _.each(this.$bubbles, function(bubble, i) {
        var $bubble = $(bubble);
        var orig = $bubble.css('background-image');
        if (_.contains(orig, 'all_gone')) {
          return;
        }
        $bubble.data('orig-background-image', orig)
               .css('background-image', 'url(/images/kittys/'+i+'.jpg)');
      });

      if ('_gaq' in window) {
        window._gaq.push(['_trackPageview', '/kitten-mode']);
      }
    },

    serializeData: function() {
      var data = this.model.toJSON();
      data.myVariable = this.myVariable;
      return data;
    },

    _hideKittenMode: function() {
      _.each(this.$bubbles, function(bubble) {
        var orig = $.data(bubble, 'orig-background-image');
        if (orig) {
          bubble.style.backgroundImage = orig;
        }
      });
    }

  });


  new KittenMode({ el: $('#kitten-mode')});

}(Backbone, jQuery));
