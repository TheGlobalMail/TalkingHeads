(function($, _) {
  'use strict';

  var Selector = function(container) {
    _.bindAll(this);
    this.$el = $(container);

    this.setupEvents();
    this.$button = this.$el.find('.filter-item');
    this.$selected = this.$el.find('[aria-selected]');
    this._update();
  };

  Selector.prototype = {

    setupEvents: function() {
      this.$el.on('click', '.dropdown-menu a', this.onOptionClick);
    },

    onOptionClick: function(e) {
      this.$selected = $(e.currentTarget);
      this._update();
    },

    _getValue: function(el) {
      return $(el).data('value') || $(el).text();
    },

    _update: function() {
      if (!this.$selected) {
        return false;
      }

      this.value = this._getValue(this.$selected);
      this.$el.find('[aria-selected]').attr('aria-selected', null);
      this.$selected.attr('aria-selected', true);
      this.$button.text(this.value);

      this.$el.trigger('dropdown:change', [this.value, this.$selected]);
    }

  };

  $('.dropdown-filter').each(function() {
    console.log(this);
    new Selector(this);
  });

}(jQuery, _));
