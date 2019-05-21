# take a deep breath.
an interactive art and sound installation created with p5.js & arduino.

## description
‘take a deep breath’ is an interactive art & sound installation that alleviates anxiety & pent-up stress by tapping into our senses. intended as a safe space, it allows us to reflect on our memories & emotions while isolated from the pressures of everyday life.

the experience features a computer-generated rain animation, meant to be projected on a wall in a dark 12 x 12’ room. a blend of synthesized chords and heavy rain plays in the background, while a circle gives deep breathing cues by expanding & contracting in sync with the music. the colors, volume, and intensity of the experience can all be controlled by raising & lowering your hands over two pillars (represented here by mason jars).

## how does it work?
the visuals are drawn in p5.js: a javascript library for creative coding. two photoresistors, one embedded in each pillar, detect the shadow of a hand passing over and send this data to an arduino uno. the microcontroller then communicates with p5.js over a local server. the p5 sketch runs full-screen in your web browser, which can be displayed on a wall/screen by a projector.

## how to install from scratch:
1. install node.js from the official website (or run brew install node)
2. install arduino IDE (duh)
3. download and unzip: https://github.com/jamezilla/p5bots/archive/master.zip
4. cd into p5bots-master
5. npm install
6. npm install -g grunt-cli
7. upload File > Examples > Firmata > StandardFirmata to your board
8. drop the contents of this repo into p5bots-master/src/p5bots-server
9. double check arduino # in board.js (for me, it’s 14201)
10. grunt server
11. open html file or go to http://localhost:8000/
