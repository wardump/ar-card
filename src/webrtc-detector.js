import './adapter.min';
import './DetectRTC.min';

export let detect = () => {
  return new Promise((resolve, reject) => {
    DetectRTC.load(() => {
      resolve(DetectRTC);
    });
  });
};

export let initCameraStream = (detectHandler) => {
  let video = document.getElementById('video');
  if (window.stream) {
    window.stream.getTracks().forEach(function (track) {
      track.stop();
    });
  }

  let constraints = {
    audio: false,
    video: {
      width:      { min: 360, max: 720 },
      height:     { min: 360, max: 1280 },
      facingMode: 'environment',
    },
  };

  function handleSuccess(stream) {
    window.stream   = stream;
    video.srcObject = stream;
    if (constraints.video.facingMode) {

      let settings    = {};
      settings.width  = window.innerWidth;
      settings.height = window.innerHeight;

      let canvas = document.getElementById('qr-canvas');
      canvas.setAttribute('width', settings.width.toString());
      canvas.setAttribute('height', settings.height.toString());

      let detector = new AR.Detector();

      let updateCanvas = () => {
        let video   = document.getElementById('video');
        let canvas  = document.getElementById('qr-canvas');
        let context = canvas.getContext('2d');

        context.drawImage(video, 0, 0, settings.width, settings.height);

        try {
          detectHandler(detector.detect(context.getImageData(0, 0, settings.width, settings.height)));
        } catch (e) {

        }
        requestAnimationFrame(updateCanvas);
      };

      requestAnimationFrame(updateCanvas);
    }
  }

  function handleError(error) {
    if (error === 'PermissionDeniedError') {
      alert('Permission denied. Please refresh and give permission.');
    }
  }

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(handleSuccess)
    .catch(handleError);
};