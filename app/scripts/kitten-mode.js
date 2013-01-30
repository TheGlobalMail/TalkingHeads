(function(Backbone, $) {
  'use strict';

  var KittenMode = Backbone.View.extend({

    events: {
      'change :checkbox': 'toggleKittenMode'
    },

    initialize: function() {
      _.bindAll(this);
      this.$chart = $('#bubble-chart');
      this.render();
    },

    toggleKittenMode: function() {
      if (this.isChecked()) {
        this._showKittenMode();
      } else {
        this._hideKittenMode();
      }
    },

    isChecked: function() {
      return this.$(':checkbox').is(':checked');
    },

    _showKittenMode: function() {
      this.$bubbles = this.$chart.find('.bubble');

      _.each(this.$bubbles, function(bubble, i) {
        var $bubble = $(bubble);
        $bubble.data('orig-background-image', $bubble.css('background-image'))
               .css('background-image', 'url(http://kittygen.herokuapp.com/?'+i+')');
      });
    },

    serializeData: function() {
      var data = this.model.toJSON();
      data.myVariable = this.myVariable;
      return data;
    },

    _hideKittenMode: function() {
      _.each(this.$bubbles, function(bubble) {
        bubble.style.backgroundImage = $.data(bubble, 'orig-background-image');
      });
    }

  });


  new KittenMode({ el: $('#kitten-mode')});

}(Backbone, jQuery));
