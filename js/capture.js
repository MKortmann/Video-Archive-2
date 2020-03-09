/*function to access the webcam*/

//settings the parametters:
let constraintObj = {
  audio: true,
  video: {
    facingMode: "user",
    width: {
      min: 640,
      ideal: 1280,
      max: 1920
    },
    height: {
      min: 480,
      ideal: 720,
      max: 1080
    }
  }
};
// width: 1280, height: 720  -- preference only
// facingMode: {exact: "user"}
// facingMode: "environment"

//handle older browsers that might implement getUserMedia in some way
//MeidaDevices.getUserMedia() method prompts the user for permission to use a
//media input which produces a MediaStream with tracks containing the requested
//types of media.
if (navigator.mediaDevices === undefined) {
  navigator.mediaDevices = {};
  navigator.mediaDevices.getUserMedia = function(constraintObj) {
    let getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia
    || navigator.msGetUserMedia || navigator.oGetUserMedia
    if (!getUserMedia) {
      return Promise.reject(new Error('the browser is not compatible or you do note have a webcam connected.'));
    }
    // if everything runs fine, it returns a Promise that resolves to a MediaStream object.
    return new Promise(function(resolve, reject) {
      getUserMedia.call(navigator, constraintObj, resolve, reject);
    });
  }
} else {
  navigator.mediaDevices.enumerateDevices()
    .then(devices => {
      devices.forEach(device => {
        console.log(device.kind.toUpperCase(), device.label);
        //, device.deviceId
      })
    })
    .catch(err => {
      console.log(err.name, err.message);
    })
}

navigator.mediaDevices.getUserMedia(constraintObj)
  .then( (mediaStreamObj) =>  {
    //connect the media stream to the first video element
    let video = document.querySelector("#video");
    if ("srcObject" in video) {
      video.srcObject = mediaStreamObj;
    } else {
      //old version (compatible)
      video.src = window.URL.createObjectURL(mediaStreamObj);
    }

    video.onloadedmetadata = function(ev) {
      //show in the video element what is being captured by the webcam
      video.play();
    };

    //add listeners for saving video/audio
    let start = document.getElementById('btnStart');
    let stop = document.getElementById('btnStop');
    let vidSave = document.getElementById('vid2');
    let mediaRecorder = new MediaRecorder(mediaStreamObj);
    let chunks = [];

    start.addEventListener('click', (ev) => {
      mediaRecorder.start();
      console.log(mediaRecorder.state);
    })
    stop.addEventListener('click', (ev) => {
      mediaRecorder.stop();
      console.log(mediaRecorder.state);
    });
    mediaRecorder.ondataavailable = function(ev) {
      chunks.push(ev.data);
    }
    mediaRecorder.onstop = (ev) => {
      let blob = new Blob(chunks, {
        'type': 'video/mp4;'
      });
      chunks = [];
      let videoURL = window.URL.createObjectURL(blob);
      vidSave.src = videoURL;
    }
  })
  .catch(function(err) {
    console.log(err.name, err.message);
  });
