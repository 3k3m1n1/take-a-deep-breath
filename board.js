//
// board.js
//
// this is a common file included in all of the html files to
// configure the software to connect to the right serial port

// You can get the serial port name in the Arduino app under Tools > Port
// or you can use the terminal (mac/linux) to list devices connected
// to your serial port:
//
//       ls -l /dev/cu.*
//

let board = p5.board( '/dev/cu.usbmodem14201', 'arduino' );
