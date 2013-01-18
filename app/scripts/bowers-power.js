(function(Backbone, $) {
  'use strict';

  var BowersPowerView = Backbone.View.extend({

    events: {
      'change :checkbox': 'toggleBowersPower'
    },

    initialize: function() {
      _.bindAll(this);
      this.$main    = $('#main');
      this.render();
    },

    render: function() {
      this.$el.append('<label><input type=checkbox> Enable Bowers Power</label>');
    },

    toggleBowersPower: function() {
      if (this.isChecked()) {
        this._showBowersPower();
      } else {
        this._hideBowersPower();
      }
    },

    isChecked: function() {
      return this.$(':checkbox').is(':checked');
    },

    _showBowersPower: function() {
      this.$bubbles = this.$main.find('.bubble');

      _.each(this.$bubbles, function(bubble) {
        var $bubble = $(bubble);
        $bubble.data('orig-background-image', $bubble.css('background-image'))
               .css('background-image', 'url(images/bowers-power.jpg)');
      });
    },

    serializeData: function() {
      var data = this.model.toJSON();
      data.myVariable = this.myVariable;
      return data;
    },

    _hideBowersPower: function() {
      _.each(this.$bubbles, function(bubble) {
        var $bubble = $(bubble);
        $bubble.css('background-image', $bubble.data('orig-background-image'));
      });
    }

  });


  new BowersPowerView({ el: $('#bowers-power')});

}(Backbone, jQuery));
