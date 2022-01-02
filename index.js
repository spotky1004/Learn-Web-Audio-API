"use strict";

/** @type {AudioBuffer} */
let audioLoaded = null;
let audioData = {
  duration: null,
  beatDetectTime: null,
  beatDetectRespectively: null
};

const audioPlayer = document.getElementById("audio_player");

/**
 * @param {File} file 
 */
function audioAccepted(file) {
  const fileReader1 = new FileReader();
  const fileReader2 = new FileReader();

  const audioContext = new AudioContext();
  
  fileReader1.addEventListener("load", function () {
    const audioContext = new AudioContext();
    audioContext.decodeAudioData(fileReader1.result, (buffer) => {
      audioData.duration = buffer.duration;
      analyzeAudio(audioContext, buffer);
    });
  }, false);
  
  fileReader2.addEventListener("load", () => {
    audioPlayer.src = fileReader2.result;
  }, false);
  
  if (file) {
    fileReader1.readAsArrayBuffer(file);
    fileReader2.readAsDataURL(file);
  }
}

/** @type {AnalyserNode} */
let analyser = null;
/** @type {Uint8Array} */
let dataArray = null;
/**
 * @param {AudioContext} audioContext
 * @param {AudioBuffer} audioBuffer
 */
async function analyzeAudio(audioContext, audioBuffer) {
  analyser = audioContext.createAnalyser();
  console.log(analyser);


  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(analyser);
  analyser.connect(audioContext.destination);
  source.start(0);
  
  analyser.fftSize = 2048;
  const bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
  analyser.getByteTimeDomainData(dataArray);
  
  draw();
}

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas");
function draw() {
  analyser.getByteTimeDomainData(dataArray);

  const WIDTH = canvas.width = innerWidth - 10;
  const HEIGHT = canvas.height = innerHeight / 5;

  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const bufferLength = dataArray.length;
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#fff";
  ctx.beginPath();
  ctx.moveTo(0, HEIGHT/2);
  for (let i = 0; i < bufferLength; i++) {
    ctx.lineTo(
      i * WIDTH/bufferLength,
      dataArray[i] * HEIGHT/256
    );
  }
  ctx.lineTo(0, HEIGHT/2);
  ctx.stroke();
  console.log(Math.min(...dataArray));

  requestAnimationFrame(draw);
}
