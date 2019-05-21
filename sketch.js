/*
 * take a deep breath.
 * artist: ekemini nkanta
 * github: https://github.com/3k3m1n1
 * portfolio: https://openlab.citytech.cuny.edu/enkanta-eportfolio/
 *
 * description: anxiety relief via generated raindrops, deep breathing
 *							cues, & relaxing audio controlled by the user.
 *
 * how to interact: connect an arduino uno with 2 photoresistors (light
 *									sensors). raise and lower your hand over the left
 *									sensor to change the volume of the chords & the color
 *									of the circle. do the same to the right sensor
 *									to change the volume and intensity of the rain.
 *									focus on the circle. breathe in. breathe out.
 */


// arduino setup: initialize board and pins
var lh; // left-hand photocell
var rh; // right-hand ""
var leftLowest, leftHighest;
var rightLowest, rightHighest;
var hueValue;
var cellValue = .6; // default until i connect another sensor

var a = 0.0; // the rate at which the circle changes
var d = []; // array of raindrops
var bkgd, chords, rain;

var rgb1, rgb2, c;
var light = 21; // value of RGB LEDs in each pillar
var up = true; // for counting up and down


function preload() {
	bkgd = loadSound('windyChords.wav');
	chords = loadSound('somberChords.wav');
	rain = loadSound('heavyRain.wav');
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	colorMode(HSB, 360, 100, 100, 1);
	background(0);

	//default values
	hueValue = 190;
	leftLowest = 20;
	rightLowest = 60;
	leftHighest = 70;
	rightHighest = 70;

	for (var i = 0; i < 400; i++) {
		// generate 500 raindrops at the start, these will be used throughout
    d.push(new Drop(random(0, windowWidth), random(0, windowHeight), random(2, 4)));
  }

	var playMode = 'reset'; // restarting the audio won't overlap w/ current playback
	noLoop(); // audio isn't allowed to play until user interacts, but i want it to play in sync with draw(), so i'll start them together.

	lh = board.pin(0, 'ANALOG', 'INPUT');
  lh.read(lhUpdated); //runs each time the sensor value changes
	rh = board.pin(1, 'ANALOG', 'INPUT');
  rh.read(rhUpdated); //runs each time the sensor value changes

	rgb1 = board.pin({r: 9, g: 10, b: 11}, 'RGBLED');
	rgb2 = board.pin({r: 3, g: 5, b: 6}, 'RGBLED');

}

function draw() {
	// fade effect: shade background with alpha bkgd
	colorMode(HSB, 360, 100, 100, 1);
	background(0, .2);

	// update rain particles
	for (var i = 0; i < d.length; i++) {
		d[i].displ();
	}

	// draw circle cue: starts small, increases to max, then gets smaller
	noFill();
	stroke(hueValue, 100, 50, .39);
	strokeWeight(12);
	circle(windowWidth/2, windowHeight/2, -50*cos(a + 20)+100);
	a += 0.02015; // speed of circle animation

	// BONUS: pillars glow in sync with music!
	colorMode(RGB);
	if (up) {
		light += 2;
		if (light == 255) {
			up = false;
		}
	} else {
		light -= 2;
		if (light == 21) {
			up = true;
		}
	}
	c = color(light, light, light);
	rgb1.write(c);
	rgb2.write(c);
}

function lhUpdated(value) {
	// left hand controls the chords volume + circle color.

	// dynamically calculated range! thank you, James Hughes :) (jamezilla/p5bots)
  if (value < leftLowest) {
    leftLowest = value;
  }

  if (value > leftHighest) {
    leftHighest = value;
  }

  hueValue = map(value, leftLowest, leftHighest, 300, 180);
	// won't cycle thru the entire color wheel -- only from aqua to violet

	chords.setVolume(map(value, leftLowest, leftHighest, 0, 6), 0.2);
	// brighter -> quieter
}

function rhUpdated(value) {
	// right hand controls the rain volume and animation speed.

  if (value < rightLowest) {
    rightLowest = value;
  }

  if (value > rightHighest) {
    rightHighest = value;
  }

	cellValue = map(value, rightLowest, rightHighest, 0.6, 8);
	// will be used to scale animation speed in rain.js (brighter -> faster)

	rain.setVolume(map(value, rightLowest, rightHighest, 0, 0.7), 0.2);
	// brighter -> louder
}

function mouseClicked() {
	// user interaction is required before autoplay, otherwise i wouldn't do this.
	bkgd.setVolume(1);
	chords.setVolume(0);

	// start all audio at the sane time (even if vol = 0)
	bkgd.loop();
	chords.loop();
	rain.loop();

	loop(); // let's start draw()
}

function windowResized(){
  resizeCanvas(window.innerWidth, window.innerHeight);
}
