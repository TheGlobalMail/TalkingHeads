(function(Modal) {
  'use strict';

  Modal.prototype.escape = function() {
    if (this.isShown && this.options.keyboard) {
      $(document.body).on('keyup.dismiss.modal', _.bind(function(e) {
        if (e.which === 27) {
          this.hide();
        }
      }, this));
    } else if (!this.isShown) {
      $(document.body).off('keyup.dismiss.modal');
    }
  };

}($.fn.modal.Constructor));
