(function(d3, $, _) {
  'use strict';

  var BubbleChart = function(container, options) {
    _.bindAll(this, '_collide', 'gravity', 'render', 'tick', 'getValue', 'getId', 'setBubblePosition');
    this.options = _.extend({}, this.defaults, options);
    this.$el     = $(container).addClass('stage').attr('role', 'list');

    this.set('height', this.$el.height())
        .set('width', this.$el.width());

    this.force = d3.layout.force()
      .gravity(0)
      .charge(0)
      .on('tick', this.tick);

    this.dataToRadiusScale = d3.scale.pow();
  };

  BubbleChart.prototype = {

    defaults: {
      // dampens the effects of gravity
      // descresing this will slow down the velocity
      // of the bubbles as they're finding their resting place
      damper: 0.055,

      // lower values make the bubbles move around smoother
      jitter: 0.45,

      // smallest bubble in pixels
      minimumBubbleSize: 35,

      // largest bubble in pixels
      maximumBubbleSize: 140,

      // manipulate the scale at which the data value
      // is converted to bubble radius size, 1 in linear
      dataToRadiusFactor: 1,

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

    getValue: function(d) {
      return d[this.options.valueAttribute];
    },

    getId: function(d) {
      return d.radius + this.options.valueAttribute + d.id;
    },

    // get option value
    get: function(key) {
      return (key in this.options) && this.options[key];
    },

    setData: function(data) {
      this.data = data;
      this.processData();
      return this;
    },

    // do a bit of fiddling with the data to get it
    // ready for bubblisationing
    processData: function() {
      this.data = this.data.slice(0, this.options.bubblesToShow);

      if (this.data.length === 0) {
        return this.allGone();
      }

      // now the data is sorted and truncated, figure out the size scale
      this.dataToRadiusScale
        .exponent(this.options.dataToRadiusFactor)
        .domain([
          // sorted descendingly, so last is lowest
          this.getValue(_.last(this.data)), // lowest value
          this.getValue(_.first(this.data)) // highest value
        ])
        .range([
          this.options.minimumBubbleSize,
          this.options.maximumBubbleSize
        ]);

      _.each(this.data, function(d) {
        d.radius = this.dataToRadiusScale(this.getValue(d));
        d.forceR = d.radius / 2;
      }, this);
    },

    allGone: function() {
      this.data = [{
        radius: 475,
        forceR: 475/2,
        imageFull: '/images/all_gone.jpg',
        name: 'Awww no!',
        square: true
      }];
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
      this.force
        .nodes(this.data)
        .size([this.options.width, this.options.height]);

      this.$el
        .height(this.options.width + 'px')
        .width(this.options.width + 'px');
    },

    _setLeftAndTop: function(el, left, top) {
      el.style.left = left;
      el.style.top  = top;
    },

    _setTranslate3d: function(el, left, top) {
      var translate = 'translate3d(' + left + ',' + top + ',0)';
      el.style.webkitTransform = translate;
      el.style.transform = translate;
    },

    setBubblePosition: function() {
      var _setTranslate3d = this._setTranslate3d;
      var _setLeftAndTop  = this._setLeftAndTop;

      return function(d) {
        var left = (d.x - d.forceR) + 'px';
        var top  = (d.y - d.forceR) + 'px';

        if (Modernizr.csstransforms3d) {
          _setTranslate3d(this, left, top);
        } else {
          _setLeftAndTop(this, left, top);
        }
      };
    },

    render: function() {
      this._beforeRender();
      var div = d3.select(this.$el[0]);

      if (this.bubbles) {
        this.bubbles.remove();
      }

      this.bubbles = div.selectAll('a.bubble').data(this.data, this.getId);
      this.bubbles
        .enter().append('a')
          .attr({
            'class': 'bubble',
            role: 'listitem'
          })
          .style({
            width: function(d) { return d.radius + 'px'; },
            height: function(d) { return d.radius + 'px'; },
            'background-image': function(d) { return 'url(' + d.imageFull + ')'; }
          })
          .each(function(d) {
            if (!Modernizr.backgroundsize && this.filters) {
              var filter = this.filters.item("DXImageTransform.Microsoft.AlphaImageLoader");
              filter.src = d.imageFull;
              filter.sizingMethod = 'scale';
            }
            $.data(this, 'model', d);
          });

      this.$el.find('[rel=tooltip]').tooltip();

      this.force.start();
    },

    tick: function(e) {
      var dampenedAlpha = e.alpha * this.options.damper;

      this.bubbles
        .call(this.force.drag)
        .each(this.gravity(dampenedAlpha))
        .each(this._collide)
        .each(this.setBubblePosition());
    }

  };

  window.BubbleChart = BubbleChart;

}(d3, jQuery, _));
