(function($, _) {
  'use strict';

  var Selectr = function(container) {
    _.bindAll(this);
    this.$el = $(container);

    this.setupEvents();
    this.$button = this.$('.filter-item');
    this.$selected = this.$('[aria-selected]');
    this._update(true);
  };

  Selectr.prototype = {

    // shortcut to select elements
    $: function(selector) {
      return this.$el.find(selector);
    },

    setupEvents: function() {
      this.$el.on('click', '.dropdown-menu a', this.onOptionClick);
    },

    onOptionClick: function(e) {
      this.$selected = $(e.currentTarget);
      this._update();
    },

    // get the value of the option
    _getValue: function($option) {
      return $option.data('value') || $option.text();
    },

    // update the shown value based on the selected option
    // call with silent = true to skip event triggering
    _update: function(silent) {
      if (!this.$selected) {
        return false;
      }

      this.value = this._getValue(this.$selected);
      this.$('[aria-selected]').attr('aria-selected', null);
      this.$selected.attr('aria-selected', true);
      this.$button.text(this.value);

      if (!silent) {
        this.$el.trigger('selectr:change', [this.value, this.$selected]);
      }
    }

  };

  $.fn.selectr = function() {
    this.each(function() {
      new Selectr(this);
    });

    return this;
  };

  // $.fn.selector.Constructor = Selectr;

}(jQuery, _));
