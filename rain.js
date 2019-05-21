/* rain.js credit:
 * original "Drop" function was posted by Dale R Basye
 * on openprocessing.org :) I commented the code,
 * tweaked a few values (like the splashes) &
 * switched from mouse input to an Arduino sensor.
 */

function Drop(x, y, sp) {
  var x1 = x;
  var y1 = y;
  var x2;
  var y2;
  var s = sp;


  this.displ = function() {
    // converts photocell values

    y1 = y1 + (s * cellValue); // scales speed according to sensor value
    x2 = x1;
    y2 = y1 + 30; // length of raindrops, change if they're too long/short

    stroke(0, 0, 78.43);
    strokeWeight(1);
    line(x1, y1, x2, y2); // draws raindrop

    if (y1 >= windowHeight - random(80,120)) { // did the drop hit the ground?
      noStroke();
      fill(0, 0, 78.43); // or 100, .59
      ellipse(x1, windowHeight - random(5, 50), random(2, 5), random(1, 4)); // then draw a splash

			// renews the drop by sending it back to the top (no need to generate new ones)
			x1 = random(0, windowWidth);
      y1 = -120;
    }
  }

}
