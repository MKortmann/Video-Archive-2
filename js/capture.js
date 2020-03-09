/*function to access the webcam*/

//settings the parametters:
//A MediaStreamConstraints obj especify the types of media to request, along with
//any requirements for each type.
let constraints = {
  audio: true,
  video: {
    facingMode: "user",  //get the front camera
    // facingMode: { exact: "environment"}, //require the rear cameras
    // deviceId: "???->add here your preferredCameraDeviceId", //setting a specific device
    framerate: {ideal: 10, max: 15},
    width: {
      min: 640,
      ideal: 1280, //it means that the browser try to find the webcam that is nearest to ideal in case you have more than one
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

//getUserMedia API can be used only in secure contexts! In insecure contexts it is
//undefined. What is secure contexts?
/*https, file:///, or localhost*/
if (navigator.mediaDevices === undefined) {
  navigator.mediaDevices = {};
  navigator.mediaDevices.getUserMedia = function(constraints) {
    let getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia
    || navigator.msGetUserMedia || navigator.oGetUserMedia
    if (!getUserMedia) {
      return Promise.reject(new Error('the browser is not compatible or you do note have a webcam connected.'));
    }
    // if everything runs fine, it returns a Promise that resolves to a MediaStream object.
    return new Promise(function(resolve, reject) {
      getUserMedia.call(navigator, constraints, resolve, reject);
    });
  }
} else {
  //give us a list of all enumerateDevices as webcam and microphones
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
    //getUserMedia always as for user permission!
  navigator.mediaDevices.getUserMedia(constraints)
    .then( (stream)  => {
    /* use the stream */
    //connect the media stream to the first video element
    let video = document.querySelector("#video");
    if ("srcObject" in video) {
      video.srcObject = stream;
    } else {
      //old version (compatible)
      video.src = window.URL.createObjectURL(stream);
    }

    video.onloadedmetadata = function(ev) {
      //show in the video element what is being captured by the webcam
      video.play();
    };

    //add listeners for saving video/audio
    let start = document.querySelector("#btnStart");
    let stop = document.querySelector("#btnStop");
    let vidSave = document.querySelector("#vid2");
    //using a media stream recorder api
    let mediaRecorder = new MediaRecorder(stream);
    let chunks = [];

    start.addEventListener('click', (ev) => {
      mediaRecorder.start();
      console.log(mediaRecorder.state);
    })
    stop.addEventListener('click', (ev) => {
      mediaRecorder.stop();
      console.log(mediaRecorder.state);
    });
    //storing the data on chunks
    mediaRecorder.ondataavailable = function(ev) {
      chunks.push(ev.data);
    }
    mediaRecorder.onstop = (ev) => {
      let blob = new Blob(chunks, {
        'type': 'video/mp4;'
      });
      //clearing the array to save memory
      chunks = [];
      let videoURL = window.URL.createObjectURL(blob);
      vidSave.src = videoURL;
    }
  })
    .catch( (err) => {
    /* handle the error */
    console.log(err.name, err.message);
  })
