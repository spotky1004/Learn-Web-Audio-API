"use strict";

/** @type {AudioBuffer} */
let audioLoaded = null;
let audioData = {
    duration: null,
    beatDetectTime: null,
    beatDetectRespectively: null
};
const audioPlayer = document.getElementById("audio_player");

function audioAccepted(file, t) {
    let reader1 = new FileReader();
    let reader2 = new FileReader();
    
    reader1.addEventListener("load", function () {
        // to data
        const audioContext = new AudioContext()
        audioContext.decodeAudioData(reader1.result, function(arrayBuffer) {
            audioLoaded = arrayBuffer;
            audioData.duration = arrayBuffer.duration;
            drawGraph();
        });
    }, false);

    reader2.addEventListener("load", function () {
        // preview
        audioPlayer.src = reader2.result;
    }, false);

    if (file) {
        reader1.readAsArrayBuffer(file);
        reader2.readAsDataURL(file);
    }
}

const graphContainer = document.getElementById("graphContainer");
const graphCanvas = document.getElementById("graphCanvas");
/** @type {CanvasRenderingContext2D} */
const graphC = graphCanvas.getContext("2d");
function drawGraph() {
    /** @type {CanvasRenderingContext2D} */
    const c = graphC;
    const w = graphCanvas.width = graphContainer.offsetWidth;
    const h = graphCanvas.height = graphContainer.offsetHeight;
    

    graphOverlayCanvas.width = w;
    graphOverlayCanvas.height = h;
    tmpCanvas.width = w;
    tmpCanvas.height = h;
    

    const channelToanAlyze = [...audioLoaded.getChannelData(0)];
    const per = 1000;
    const perDt = audioData.duration/(channelToanAlyze.length/per)*1000;
    let skippedData = [];
    for (let i = 0, l = channelToanAlyze.length/per; i < l; i++) {
        skippedData.push(channelToanAlyze.slice(per*i, per*(i+1)).reduce((a, b) => a = Math.max(a, b), 0));
    }

    audioData.beatDetectTime = [];
    audioData.beatDetectRespectively = [];
    let beatDetectIdx = [];
    let lastData = 0;
    let isAlreadyPeak = false;
    for (let i = 0, l = skippedData.length; i < l; i++) {
        if (skippedData[i] > lastData) {
            if (!isAlreadyPeak) {
                audioData.beatDetectTime.push(Math.floor(perDt*i));
                audioData.beatDetectRespectively.push(skippedData[i]);
                beatDetectIdx.push(i);
                isAlreadyPeak = true;
            }
        } else {
            isAlreadyPeak = false;
        }
        lastData = skippedData[i];
    }
    

    c.lineWidth = 1;
    c.lineCap = "round";
    c.moveTo(0, h);
    for (let i = 0, l = skippedData.length; i < l; i++) {
        const peak = skippedData[i];
        const [x, y] = [w*((i+1)/l), h*(1-peak)];
        if (beatDetectIdx.includes(i)) {
            c.fillStyle = "#0f0";
            c.fillRect(x-3, y-3, 6, 6);
        }
        c.lineTo(x, y);
        c.stroke();
        c.moveTo(x, y);
    }
}

const graphOverlayCanvas = document.getElementById("graphOverlayCanvas");
/** @type {CanvasRenderingContext2D} */
const graphOverlayC = graphOverlayCanvas.getContext("2d");
const tmpCanvas = document.createElement("canvas");
const tmpCanvasC = tmpCanvas.getContext("2d");
setInterval(function() {
    /** @type {CanvasRenderingContext2D} */
    const c = graphOverlayC;

    tmpCanvasC.beginPath();
    tmpCanvasC.clearRect(0, 0, graphOverlayCanvas.width, graphOverlayCanvas.height);
    tmpCanvasC.drawImage(graphOverlayCanvas, 0, 0);

    c.beginPath();
    c.globalAlpha = 0.94;
    c.clearRect(0, 0, graphOverlayCanvas.width, graphOverlayCanvas.height);
    c.drawImage(tmpCanvas, 0, 0);
    c.globalAlpha = 1;
    if (!isNaN(audioPlayer.duration)) {
        const [x, y] = [
            graphOverlayCanvas.width*(audioPlayer.currentTime/audioPlayer.duration),
            graphOverlayCanvas.height
        ];

        c.strokeStyle = "#f00";
        c.moveTo(x, 0);
        c.lineTo(x, y);
        c.stroke();
    }
}, 30);