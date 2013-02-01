TalkingHeads.module('Models', function(Models, TalkingHeads, Backbone) {
  'use strict';

  Models.Member = Backbone.Model.extend({

    idAttribute: 'person_id',

    mutators: {
      name: function() {
        return this.first_name + ' ' + this.last_name;
      },

      imageFull: function() {
        this.image = this.image || '';
        return this.image.replace('.jpg', '_full.jpg');
      },

      durationString: function() {
        var hours = Math.floor(this.duration / 60 / 60);
        var minutes = Math.floor((this.duration / 60) % 60);

        if (hours && minutes) {
          return hours + 'h ' + minutes + 'm';
        }

        if (minutes) {
          return minutes + 'm';
        }

        return hours + 'h';
      }
    }

  });

  Models.Members = Backbone.Collection.extend({
    model: Models.Member,
    url: 'http://politalk-api.theglobalmail.org/api/members',

    speakerParties: [
      'PRES',
      'DPRES',
      'CWM',
      'SPK',
      'Speaker',
      'Deputy-President',
      'Deputy-Speaker',
      'President'
    ],

    partyNameMap: {
      Labor: ['Australian Labor Party'],
      Liberals: ['Liberal Party'],
      National: ['National Party'],
      Greens: ['Australian Greens'],
      Other: [
        'Independent',
        'Country Liberal Party',
        'Family First Party',
        'Australian Democrats',
        'Democratic Labor Party'
      ]
    },

    initialize: function() {
      Backbone.Collection.prototype.initialize.apply(this, arguments);
      _.bindAll(this, '_filter');
      this.listenTo(TalkingHeads.vent, 'filters', this.setFilters, this);
      this._modelsByYear = {};
      this.filters = {
        year: '2012',
        party: [
          'Liberals',
          'Labor',
          'Greens',
          'National'
        ],
        house: 0
      };
      this.promise = this.setFilters({});
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
    },

    setFilters: function(filters) {
      var promise;

      _.extend(this.filters, filters);
      this.unselectedParties = this._getUnselectedParties(this.filters.party);


      promise = this._filterByYear(this.filters.year);
      promise.done(this._filter);

      return promise;
    },

    _filter: function() {
      var models = this.filter(function(model) {
        // filter out by speaker parties
        if (_.contains(this.speakerParties, model.get('party'))) {
          return false;
        }

        // filter by selected house
        if (model.get('house') === this.filters.house) {
          return false;
        }

        // filter out by unselected parties
        if (_.contains(this.unselectedParties, model.get('party'))) {
          return false;
        }

        return true;
      }, this);

      this.reset(models);
      this.trigger('filter');
    },

    _filterByYear: function(year) {
      var promise;

      if (year in this._modelsByYear) {
        this.reset(this._modelsByYear[year]);
        promise = new $.Deferred();
        promise.resolve(this._modelsByYear[year]);
      } else {
        promise = this.fetch({ data: this._getYearRange(year), silent: true });
        promise.done(_.bind(function(data) {
          this._modelsByYear[year] = data;
        }, this));
      }

      return promise;
    },

    // takes an array of short party names and return the inverse in long names
    _getUnselectedParties: function(parties) {
      var unselectedLongNames = [];

      _.each(this.partyNameMap, function(longNames, shortName) {
        // the short name isn't in the parties provided
        if (!_.contains(parties, shortName)) {
          unselectedLongNames.push(longNames);
        }
      });

      return _.flatten(unselectedLongNames);
    },

    // create a year range for the REST API
    _getYearRange: function(year) {
      return {
        from: year + '-01-01',
        to: year + '-12-31'
      };
    }

  });

  // Starting fetching immediately!
  TalkingHeads.members = new Models.Members();
});
