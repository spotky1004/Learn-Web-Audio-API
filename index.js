"use strict";

/** @type {AudioBuffer} */
let audioLoaded = null;

function audioAccepted(file, t) {
    let reader1 = new FileReader();
    let reader2 = new FileReader();
    
    reader1.addEventListener("load", function () {
        // to data
        const audioContext = new AudioContext()
        audioContext.decodeAudioData(reader1.result, function(audioBuffer) {
            audioLoaded = audioBuffer;
            drawGraph();
        });
    }, false);

    reader2.addEventListener("load", function () {
        // preview
        document.getElementById("audio_player").src = reader2.result;
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
    
    const channelToDraw = [...audioLoaded.getChannelData(0)];
    const divideFactor = 1000;
    const per = Math.floor(channelToDraw.length)/divideFactor;

    c.moveTo(0, h);
    for (let i = 0; i < divideFactor; i++) {
        const peak = channelToDraw.slice(per*i, per*(i+1)).reduce((a, b) => a = Math.max(a, b), 0);
        const [x, y] = [w*((i+1)/divideFactor), h*(1-peak)];
        c.lineTo(x, y);
        c.stroke();
        c.moveTo(x, y);
    }
}