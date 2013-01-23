(function(d3, $, _) {
  'use strict';

  var promise = $.getJSON('http://politalk-api.herokuapp.com/api/members');
  var chart;

  promise.done(function(members) {
    chart = new BubbleChart(document.getElementById('bubble-chart'), members, {
      width: $(window).width(),
      height: $(window).height()
    });

    chart.render();
  });

  var BubbleChart = function(container, data, options) {
    _.bindAll(this, '_collide', 'gravity');
    this.options = _.extend({}, this.defaults, options);
    this.data    = data;
    this.$el     = $(container).addClass('stage').attr('role', 'list');

    this.set('height', this.$el.height())
        .set('width', this.$el.width());

    this.force = d3.layout.force().gravity(0).charge(0);
    this.dataToRadiusScale = d3.scale.pow();
  };

  BubbleChart.prototype = {

    defaults: {
      // dampens the effects of gravity
      // descresing this will slow down the velocity
      // of the bubbles as they're finding their resting place
      damper: 0.035,

      // lower values make the bubbles move around smoother
      jitter: 0.35,

      // smallest bubble in pixels
      minimumBubbleSize: 35,

      // largest bubble in pixels
      maximumBubbleSize: 140,

      // manipulate the scale at which the data value
      // is converted to bubble radius size, 1 in linear
      dataToRadiusFactor: 0.9,

      // Affect minimum distance between bubbles (even during collision detection)
      // 0 is neatly touching, negative values will make bubbles overlap
      collisionPadding: 3,

      // Max number of bubbles to show in the chart
      bubblesToShow: 50
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

    // return the value off the data object for use in the chart
    getValue: function(d) {
      return d.duration;
    },

    // do a bit of fiddling with the data to get it
    // ready for bubblisationing
    processData: function() {
      this.data.sort(_.bind(function(a, b) {
        return -(this.getValue(a) - this.getValue(b));
      }, this));

      this.data = this.data.slice(0, this.options.bubblesToShow);

      _.each(this.data, function(d) {
        d.radius = this.dataToRadiusScale(this.getValue(d));
        d.forceR = d.radius / 2;
        d.image = d.image || '';
      }, this);
    },

    // return a function the simulates gravity
    // by tweaking x and y values for each node
    gravity: function(alpha) {
      var centerX = this.options.width / 2;
      var centerY = this.options.height / 2;

      var alphaX = alpha;
      var alphaY = alpha / 1.3; // favor Y axis a tad

      return function(d) {
        d.x += (centerX - (d.x || 0)) * alphaX;
        d.y += (centerY - (d.y || 0)) * alphaY;
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
      this.dataToRadiusScale
        .exponent(this.options.dataToRadiusFactor)
        .domain([
          this.getValue(this.data[this.options.bubblesToShow-1]), // lowest value
          this.getValue(this.data[0]) // highest value
        ])
        .range([
          this.options.minimumBubbleSize,
          this.options.maximumBubbleSize
        ]);

      this.force
        .nodes(this.data)
        .size([this.options.width, this.options.height]);

      this.$el
        .height(this.options.width + 'px')
        .width(this.options.width + 'px');

      this.processData();
    },

    render: function() {
      this._beforeRender();
      var div = d3.select(this.$el[0]);

      this.bubbles = div.selectAll('a.bubble')
        .data(this.data)
        .enter().append('a')
          .attr({
            'class': 'bubble',
            role: 'listitem',
            rel: 'tooltip',
            title: function(d) { return d.speaker; }
          })
          .style({
            width: function(d) { return d.radius + 'px'; },
            height: function(d) { return d.radius + 'px'; },
            'background-image': function(d) { return 'url(' + d.image.replace('.jpg', '_full.jpg') + ')'; }
          });

      this.$el.find('[rel=tooltip]').tooltip();

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
          top: function(d) { return (d.y - d.forceR + 20) + 'px'; }
        });
    }

  };

}(d3, jQuery, _));
