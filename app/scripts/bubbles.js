(function(d3, $, _) {
  'use strict';

  var promise = $.get('http://politalk-api.herokuapp.com/api/members');
  var chart;

  promise.done(function(members) {
    members.sort(function(a, b) {
      return -(a.duration - b.duration);
    });

    chart = new BubbleChart(document.getElementById('main'), members, {
      width: document.width * 0.5,
      height: document.height * 0.5
    });

    chart.render();
  });

  var BubbleChart = function(container, data, options) {
    _.bindAll(this, '_collide');
    this.options = _.extend({}, this.defaults, options);
    this.data    = data;
    this.$el     = $(container).addClass('stage');

    this.force = d3.layout.force().gravity(0).charge(0);
    this.durationToRadiusScale = d3.scale.pow();
  };

  BubbleChart.prototype = {

    defaults: {
      // dampens the effects of gravity
      // descresing this will slow down the velocity
      // of the bubbles as they're finding their resting place
      damper: 0.1,

      // lower values make the bubbles move around smoother
      jitter: 0.4,

      // smallest bubble in pixels
      minimumBubbleSize: 50,

      // largest bubble in pixels
      maximumBubbleSize: 140,

      // manipulate the scale at which the talk duration
      // is convert to bubble radius size, 1 in linear
      durationToRadiusFactor: 0.9,

      // Affect minimum distance between bubbles (even during collision detection)
      // 0 is neatly touching, negative values will make bubbles overlap
      collisionPadding: 0,

      // Max number of bubbles to show in the chart
      bubblesToShow: 50,

      // visualtion size
      width: 400,
      height: 400
    },

    // set option
    set: function(key, value) {
      this.options[key] = value;
      return this;
    },

    // get option value
    get: function(key) {
      return (key in this.options) && this.options[key];
    },

    setData: function(data) {
      this.data = data;
      this.processData();
    },

    // do a bit of fiddling with the data to get it
    // ready for bubblisationing
    processData: function() {
      this.data = this.data.slice(0, this.options.bubblesToShow);

      _.each(this.data, function(d) {
        d.radius = this.durationToRadiusScale(d.duration);
        d.forceR = d.radius / 2;
      }, this);
    },

    // return a function the simulates gravity
    // by tweaking x and y values for each node
    gravity: function(alpha) {
      var centerX = this.options.width / 2;
      var centerY = this.options.height / 2;

      var alphaX = alpha;
      var alphaY = alpha;

      return function(d) {
        d.x += (centerX - d.x) * alphaX;
        d.y += (centerY - d.y) * alphaY;
      };
    },

    // returns a function that will detect collisions
    // between two nodes, tweaking x and y values
    // so they sit nicely next to each other
    _collide: function(d) {
      _.each(this.data, function(d2) {
        if (d !== d2) {
        var x = d.x - d2.x;
        var y = d.y - d2.y;
        var distance = Math.sqrt(x*x + y*y);
        var minimumDistance = d.forceR + d2.forceR + this.options.collisionPadding;


        if (distance < minimumDistance) {
          distance = (distance - minimumDistance) / distance * this.options.jitter;
          var moveX = x * distance;
          var moveY = y * distance;

          d.x -= moveX;
          d.y -= moveY;
          d2.x += moveX;
          d2.y += moveY;
        }
      }
      }, this);
    },

    _beforeRender: function() {
      this.durationToRadiusScale
        .exponent(this.options.durationToRadiusFactor)
        .domain([
          this.data[this.options.bubblesToShow-1].duration, // lower duration
          this.data[0].duration // highest duration
        ])
        .range([
          this.options.minimumBubbleSize,
          this.options.maximumBubbleSize
        ]);

      this.force
        .nodes(this.data)
        .size([this.options.width, this.options.height]);

      this.$el
        .height(this.options.width)
        .width(this.options.width)
        .css('overflow', 'hidden');

      this.processData();
    },

    render: function() {
      this._beforeRender();
      var div = d3.select(this.$el[0]);

      this.bubbles = div.selectAll('div.bubble')
        .data(this.data)
        .enter().append('div')
          .attr('class', 'bubble')
          .style({
            width: function(d) { return d.radius + 'px'; },
            height: function(d) { return d.radius + 'px'; },
            'background-image': function(d) { return 'url(' + d.image + ')'; }
          });

      this.force
        .start()
        .on('tick', _.bind(this.tick, this));
    },

    tick: function(e) {
      var dampenedAlpha = e.alpha * this.options.damper;

      this.bubbles
        .each(this.gravity(dampenedAlpha))
        .each(this._collide)
        .style({
          left: function(d) { return (d.x - d.forceR) + 'px'; },
          top: function(d) { return (d.y - d.forceR) + 'px'; }
        });
    }

  };

}(d3, jQuery, _));
