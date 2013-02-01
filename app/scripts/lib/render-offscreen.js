(function($, document) {
  'use strict';

  var defaults = {
    stageId: 'offscreen-renderer',
    empty: false
  };

  var getStage = function(stageId) {
    var $stage = $(document.getElementById(stageId));

    if ($stage.length === 0) {
      $stage = $('<div/>')
        .prop('id', stageId)
        .css({
          position: 'absolute',
          left: '-10000px',
          top: '-10000px',
          height: '1000px',
          width: '1000px',
          opacity: 0,
          zIndex: -9999,
          overflow: 'hidden'
        })
        .appendTo(document.body);
    }

    return $stage;
  };

  $.fn.renderOffscreen = function(options) {
    options = $.extend({}, defaults, options);
    var $stage = getStage(options.stageId);

    if (options.empty) {
      return $stage.empty();
    }

    $stage.empty().append(this);
    return this;
  };

}(jQuery, document));
