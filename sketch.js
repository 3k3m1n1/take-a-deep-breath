/*
 * take a deep breath.
 * artist: ekemini nkanta
 * portfolio: https://openlab.citytech.cuny.edu/enkanta-eportfolio/
 *
 * description: anxiety relief via generated raindrops, deep breathing
 *							cues, & relaxing audio controlled by the user.
 *
 * how to interact: connect an arduino uno with 2 infrared (distance)
 *									sensors. raise and lower your hand over the left
 *									one to change the volume of the chords & the color
 *									of the circle. do the same to the right-hand sensor
 *									to change the volume and intensity of the rain.
 *									focus on the circle. breathe in. breathe out.
 */

var a = 0.0; // the rate at which the circle changes
var d = []; // array of raindrops
var bkgd, chords, rain;

function preload() {
	bkgd = loadSound('windyChords.wav');
	chords = loadSound('somberChords.wav');
	rain = loadSound('heavyRain.wav');
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	background(0);
	//smooth();

	for (var i = 0; i < 500; i++) {
    d.push(new Drop(random(0, windowWidth), random(0, windowHeight), random(2, 4)));
		// generate 500 raindrops at the start, these will be used throughout
  }

	var playMode = 'reset'; // restarting the audio won't overlap w/ current playback
	noLoop(); // audio isn't allowed to play until user interacts, but i want it to play in sync with draw(), so i'll start them together.
}

function draw() {
	// fade effect: shade background with alpha bkgd
	background(0, 25);

	// update rain particles
	for (var i = 0; i < d.length; i++) {
		d[i].displ();
	}

	// draw circle cue: starts small, increases to max, then gets smaller
	noFill();
	stroke(0, 213, 255, 100);
	strokeWeight(12);
	circle(windowWidth/2, windowHeight/2, -cos(a)*50+100);
	a += 0.0205; // slightly too fast, but leave it alone for now
}

function mouseClicked() { // user interaction required before autoplay, otherwise i wouldn't do this
	// default volumes
	bkgd.setVolume(0.7);
	chords.setVolume(4); // max 4, min 0
	rain.setVolume(1); // max .7, min 0

	// start all audio at the sane time (even if vol=0)
	bkgd.loop();
	chords.loop();
	rain.loop();

	loop(); // let's start draw()
}

function windowResized(){
  resizeCanvas(window.innerWidth, window.innerHeight);
}
