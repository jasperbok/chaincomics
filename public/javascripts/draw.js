(function($) {
  var settings = {},
      currentDirection = "";

  var methods = {
    init : function(options) {
      settings = $.extend({
        stepSize: 5,
        upKey: 73,
        downKey: 75,
        leftKey: 74,
        rightKey: 76,
        upButtonId: 'up-button',
        downButtonId: 'down-button',
        leftButtonId: 'left-button',
        rightButtonId: 'right-button'
      }, options);

      $(document).on('keyup.etchasketch', methods.handleKeyup);
      $(document).on('keydown.etchasketch', methods.handleKeydown);
      $('#' + settings.upButtonId).on('vmousedown.etchasketch', {direction: 'up'}, methods.handleButtonDown);
      $('#' + settings.upButtonId).on('vmouseup.etchasketch', methods.handleButtonUp);
      $('#' + settings.downButtonId).on('vmousedown.etchasketch', {direction: 'down'}, methods.handleButtonDown);
      $('#' + settings.downButtonId).on('vmouseup.etchasketch', methods.handleButtonUp);
      $('#' + settings.leftButtonId).on('vmousedown.etchasketch', {direction: 'left'}, methods.handleButtonDown);
      $('#' + settings.leftButtonId).on('vmouseup.etchasketch', methods.handleButtonUp);
      $('#' + settings.rightButtonId).on('vmousedown.etchasketch', {direction: 'right'}, methods.handleButtonDown);
      $('#' + settings.rightButtonId).on('vmouseup.etchasketch', methods.handleButtonUp);

      setInterval(methods.drawLine, 50);
    },

    handleButtonDown : function(e) {
      currentDirection = e.data.direction;
    },

    handleButtonUp : function(e) {
      currentDirection = "";
    },

    handleKeyup : function(e) {
      currentDirection = "";
    },

    handleKeydown : function(e) {
      if (e.keyCode == settings.leftKey) {
        currentDirection = "left";
      } else if (e.keyCode == settings.upKey) {
        currentDirection = "up";
      } else if (e.keyCode == settings.rightKey) {
        currentDirection = "right";
      } else if (e.keyCode == settings.downKey) {
        currentDirection = "down";
      }
    },

    drawLine : function() {
      if (currentDirection != "") { 
        console.log('drawline');
        var x = 0
          , y = 0;

        switch(currentDirection) {
          case 'up':
            y = -(settings.stepSize);
            break;
          case 'down':
            y = settings.stepSize;
            break;
          case 'left':
            x = -(settings.stepSize);
            break;
          case 'right':
            x = settings.stepSize;
            break;
          }

        ctx.beginPath();
        ctx.moveTo(cursor.x, cursor.y);
        ctx.lineTo(cursor.x + x, cursor.y + y);
        ctx.stroke();
        cursor.x += x;
        cursor.y += y;
      }
    }
  };

  var canvas = $('#drawing-canvas')
    , canvasWidth = $(canvas).attr('width')
    , canvasHeight = $(canvas).attr('height')
    , ctx = document.getElementById('drawing-canvas').getContext('2d')
    , cursor = {x:0, y:0};

  $.fn.etchASketchCanvas = function(method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' + method + ' does not exist on jQuery.etchASketch');
    }
  };
})(jQuery);
