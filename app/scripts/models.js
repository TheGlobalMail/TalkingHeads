TalkingHeads.module('Models', function(Models, TalkingHeads, Backbone) {
  'use strict';

  Models.Member = Backbone.Model.extend({

    idAttribute: 'person_id',

    initialize: function() {
      this.on('change:image', this.setFullImage);
    },

    setFullImage: function(model, value) {
      model.set('fullImage', value.replace('.jpg', '_full.jpg'));
    }

  });

  Models.Members = Backbone.Collection.extend({
    model: Models.Member,
    url: 'http://politalk-api.herokuapp.com/api/members',

    initialize: function() {
      Backbone.Collection.prototype.initialize.apply(this, arguments);
      this.promise = this.fetch();
    },

    loaded: function(fn) {
      var loaded = function(data) {
        fn(data, this);
      };

      this.promise.done(loaded);
      return this;
    },

    sortByMostVocal: function() {
      this.setSortBy('duration', true);
    },

    sortByLeastVocal: function() {
      this.setSortBy('duration');
    },

    sortByMostInterjections: function() {
      this.setSortBy('interjections', true);
    },

    setSortBy: function(attribute, descending) {
      this.comparator = function(model) {
        if (descending) {
          return -model.get(attribute);
        } else {
          return model.get(attribute);
        }
      };
      this.sortAttribute = attribute;
      this.sort();
    }
  });

  // Starting fetching immediately!
  TalkingHeads.members = new Models.Members();
});
