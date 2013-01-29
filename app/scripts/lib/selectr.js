(function($, _) {
  'use strict';

  var Selectr = function(container) {
    _.bindAll(this);

    this.$el       = $(container);
    this.$button   = this.$('.dropdown-toggle');
    this.$selected = this.$('[aria-selected]');
    this.$options  = this.$('.dropdown-menu a');

    this.setupEvents();
    this._update(true);
  };

  Selectr.prototype = {

    // shortcut to select elements
    $: function(selector) {
      return this.$el.find(selector);
    },

    setupEvents: function() {
      this.$options.on('click', this.onOptionClick);
    },

    onOptionClick: function(e) {
      this.$selected = $(e.currentTarget);
      this._update();
    },

    // get the value of the option
    _getValue: function($option) {
      var value = $option.data('value');
      if (_.isUndefined(value)) {
        value = $option.text();
      }
      return value;
    },

    getValue: function() {
      return this.value;
    },

    setSelected: function(value, silent) {
      _.each(this.$options, function(el) {
        var $el = $(el);
        if (value === this._getValue($el)) {
          this.$selected = $el;
        }
      }, this);
      this._update(silent);
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
      this.$button.text(this.$selected.text());

      if (!silent) {
        this.$el.trigger('selectr:change', [this.value, this.$selected]);
      }
    }

  };

  $.fn.selectr = function() {
    var $el = $(this);
    var data = $el.data('selectr');

    if (!data) {
      $el.data('selectr', (data = new Selectr(this)));
    }

    return data;
  };

   $.fn.selectr.Constructor = Selectr;

}(jQuery, _));
