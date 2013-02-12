(function(app, $, location) {
  'use strict';

  var $tweetContainer = $('.share-button.twitter');
  var $tweetButtonTemplate = $('.twitter-share-button-template');
  var widgetJs = $.getScript("//platform.twitter.com/widgets.js");

  var $likeContainer = $('.share-button.facebook');
  var $likeButtonTemplate = $('.fb-like');

  function createTweetButton(url) {
    var $button = $tweetButtonTemplate.clone();
    $button.removeAttr('style');
    $button.attr('data-url', url);
    $button.attr('class', 'twitter-share-button');

    return $button;
  }

  function createLikeButton(url) {
    var $button = $likeButtonTemplate.clone();
    $button.attr('data-url', url);
    return $button;
  }

  app.vent.on('route', function() {
    $tweetContainer.empty().append(createTweetButton(location.toString()));
    $likeContainer.empty().append(createLikeButton(location.toString()));

    widgetJs.done(function() {
      if (typeof window.twttr !== 'undefined' && 'widgets' in window.twttr) {
        window.twttr.widgets.load($tweetContainer[0]);
      }
    });

    if ('FB' in window) {
      window.FB.XFBML.parse($likeContainer[0]);
    }
  });
}(TalkingHeads, $, window.location));
