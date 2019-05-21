#!/usr/bin/env node
'use strict';

const express = require( 'express' );
const app = express();
const server = require( 'http' ).Server( app );

const // jshint ignore:line
io = require( 'socket.io' )( server );

const Firmata = require( 'firmata' );
const program = require( 'commander' );
const fs = require( 'fs' );
const path = require( 'path' );

// Parse command-line args
let directory;

let index;

function makeAbsolute( filepath ) {
  if ( path.isAbsolute( filepath ) ) {return filepath;}
  else {return process.cwd() + '/' + filepath;}
}

// This both defines options as well as what prints when '--help' is called.
program
  .description( 'Run `node app.js` plus these flags to configure your server.' )
  .option( '-d, --dir <d>', 'Set base directory for server' )
  .option( '-f, --file <f>', 'Set file to use for index page' )
  .option( '-p, --ufilepath <p>',
    'Path to file containing user-defined server-side listeners.' )
  .option( '-n, --ufilename <n>',
    'Path, including file name, to user-defined server-side listeners.' )
  .parse( process.argv );

exports.program = program;
exports.directory = directory = program.dir || __dirname;
exports.index = index = program.file || ( directory + '/index.html' );

// Setup server, sockets, and events

server.listen( 8000 );

app.use( express.static( directory ) );
console.log( 'server starting' );

app.get( '/', function( req, res ) {
  res.sendFile( makeAbsolute( index ) );
} );


// App code: Define as export for IDE, call at end of file for non-IDE usage

let setup = exports.setup = function( io ) {

  let board;

  io.of( '/sensors' ).on( 'connect', function( socket ) {
    console.log( 'connected' );
    exports.socket = socket;

    // Error handling

    socket.on( 'error', function( err ) {
      console.log( err );
    } );

    // Firmata setup

    socket.on( 'board object', function( data ) {

      function init() {
        console.log( 'board object caught', data );
        initializeSpecialFuncs( board );
        socket.emit( 'board ready', { analogArr: board.analogPins } );
      }

      // If the board has already been initialized in firmata, it won't
      // call the callback again on client reload; this way the init
      // functions are called without restarting the whole process

      if ( !board ) {
        board = new Firmata( data.port, function( err ) {
          if ( err ) {
            throw new Error( err );
          }
          init();
        } );
      }
      else {
        init();
      }
    } );

    // Pin setup

    socket.on( 'pin object', function( data ) {
      console.log( 'pin object caught', data );
      // Digital pins are set to INPUT or OUTPUT in firmata
      if (data.mode === 'digital') {
        board.pinMode( data.pin, board.MODES[ data.direction.toUpperCase() ] );
      } else {
        board.pinMode( data.pin, board.MODES[ data.mode.toUpperCase() ] );
      }
    } );

    // Action functions:
    // The primary action function formats the read & write functions & sends
    // these to firmata

    socket.on( 'action', function( data ) {
      // console.log('action data', data);
      let argument = data.arg;
      if ( argument ) {
        // If it is digitalWrite, augment the argument with
        // `board` to match firmata call
        if ( argument && ( argument === 'HIGH' || argument === 'LOW' ) ) {
          board[ data.action ]( data.pin, board[ argument ] );
        }
        else {
          board[ data.action ]( data.pin, argument );
        }
        // Otherwise it is read with no argument, set pin.val on update
      }
      else if ( data.type === 'read' ) {
        board[ data.action ]( data.pin, function( val ) {
          socket.emit( 'return val' + data.pin, { val: val } );
        } );
      }
    } );

    // Special functions

    function initializeSpecialFuncs( board ) {

      // LED
      let led = require( './lib/led.js' );
      led.blink( board, socket );
      led.fade( board, socket );

      // RGB
      let rgb = require( './lib/rgb.js' );
      rgb.write( board, socket );
      rgb.read( board, socket );
      rgb.blink( board, socket );
      rgb.fade( board, socket );

      // Servo
      let servo = require( './lib/servo.js' );
      servo.range( board, socket );
      servo.sweep( board, socket );

      // Piezo
      let piezo = require( './lib/piezo.js' );
      piezo.tone( board, socket );

      // User defined, if present

      let filepath;

      if ( program.ufilename ) {
        filepath = program.ufilename;
      }
      else if ( program.ufilepath ) {
        let userpath = program.ufilepath || __dirname;
        filepath = userpath + '/user.js';
      }

      if ( filepath ) {
        filepath = path.normalize( filepath );
        fs.stat( filepath, function( err, stats ) {
          if ( err == null ) {
            let reqPath = makeAbsolute( filepath );

            let user = require( reqPath );
            let keys = Object.keys( user );

            keys.forEach( function( key ) {
              user[ key ]( board, socket );
            } );
          }
          else if ( err.code === 'ENOENT' ) {
            throw new Error( filepath +
                             ' does not seem to exist. Maybe it is a ghost.' );

          }
          else {
            console.log( err );
          }
        } );
      }

    }

    // Serial does not require firmata board
    let serial = require( './lib/serial.js' );
    serial.init( socket );
    serial.read( socket );
    serial.write( socket );
    serial.list( socket );

  } );
};

setup( io );
