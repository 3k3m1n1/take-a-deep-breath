exports.blink = function blink( board, socket ) {
  let intervals = {};

  socket.on( 'blink', function( data ) {
    const ledPin = data.pin;
    const length = data.length || 500;
    let ledOn = true;

    board.pinMode( ledPin, board.MODES.OUTPUT );

    // kill any blink interval currently assigned to the pin
    clearInterval(intervals[ledPin]);
    delete intervals[ledPin];

    let interval = setInterval( function() {
      if ( ledOn ) {
        board.digitalWrite( ledPin, board.HIGH );
      } else {
        board.digitalWrite( ledPin, board.LOW );
      }

      ledOn = !ledOn;

    }, length );
    intervals[ledPin] = interval;
  });

  socket.on( 'blink cancel', function( data ) {
    const ledPin = data.pin;
    clearInterval(intervals[ledPin]);
    delete intervals[ledPin];
  });
};

exports.fade = function fade( board, socket ) {
  socket.on( 'fade', function( data ) {
    board.pinMode( data.pin, board.MODES.PWM );

    let time = data.time;
    let start = data.start;
    let stop = data.stop;
    let inc = data.inc;
    let steps = time / inc;
    let span = Math.abs( start - stop );
    let vps = span / steps;
    let mult = stop > start ? 1 : -1;
    let val = start;


    function nextVal( a, b ) {
      return a + mult * b;
    }

    function setStep( num ) {
      setTimeout( function() {
        board.analogWrite( data.pin, val );
        val = nextVal( val, vps );
      }, num * inc );
    }

    for ( let i = 0; i <= steps; i++ ) {
      setStep( i );
    }
  } );
};
