let audioElement = document.querySelector("#audioElmId");
let canvasElement = document.querySelector("#canvasElmId");
let wave = new Wave(audioElement, canvasElement);

// Simple example: add an animation
wave.addAnimation(new wave.animations.Wave());

// Intermediate example: add an animation with options
wave.addAnimation(new wave.animations.Wave({
    lineWidth: 10,
    lineColor: "red",
    count: 20
}));

// Expert example: add multiple animations with options
wave.addAnimation(new wave.animations.Square({
    count: 50,
    diamater: 300
}));

wave.addAnimation(new wave.animations.Glob({
    fillColor: {gradient: ["red","blue","green"], rotate: 45},
    lineWidth: 10,
    lineColor: "#fff"
}));

// The animations will start playing when the provided audio element is played

// 'wave.animations' is an object with all possible animations on it.

// Each animation is a class, so you have to new-up each animation when passed to 'addAnimation'