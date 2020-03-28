import { detect, initCameraStream } from './webrtc-detector';

class Display {
  constructor() {
    this.width    = window.innerWidth;
    this.height   = window.innerHeight;
    this.absolute = 0;
    this.alpha    = 0;
    this.beta     = 0;
    this.gamma    = 0;

    window.addEventListener('deviceorientation', (event) => {
      this.orientationChange(event);
    });
  }

  orientationChange(event) {
    this.absolute = event.absolute;
    this.alpha    = event.alpha;
    this.beta     = event.beta;
    this.gamma    = event.gamma;
  }

}

class QR {

  constructor(points) {
    this.points = points;
  }

  getAngle() {
    let angle = (this.points[1].y - this.points[0].y) / (this.points[1].x - this.points[0].x);
    return Math.atan(angle) * 180 / Math.PI;
  }

}

class Transformer {

  constructor(display) {
    this.points  = [];
    this.display = display;

    this.__qr    = new QR(this.points);
    this.element = document.getElementById('content');
    this.qr      = document.getElementById('qr');

    this.videoPanel   = document.getElementById('video-panel');
    this.namePanel    = document.getElementById('name-panel');
    this.buttonsPanel = document.getElementById('buttons-panel');
    this.infoPanel    = document.getElementById('info-panel');

    this.width    = 0;
    this.angle    = 0;
    this.firstRun = true;
  }

  setPoints(points) {
    this.points = points;
    this.__qr   = new QR(this.points);
  }

  run() {
    document.getElementById('content').style.display = 'flex';
    this.transform();
    this.toCenter();
  }

  toCenter() {
    // let a1 = this.points[0].y - this.points[2].y;
    // let b1 = this.points[2].x - this.points[0].x;
    //
    // let a2 = this.points[3].y - this.points[1].y;
    // let b2 = this.points[1].x - this.points[3].x;
    //
    // let d = a1 * b2 - a2 * b1;
    //
    // if (d !== 0) {
    //     let c1 = this.points[2].y * this.points[0].x - this.points[2].x * this.points[0].y;
    //     let c2 = this.points[1].y * this.points[3].x - this.points[1].x * this.points[3].y;
    //
    //     let xi = (b1 * c2 - b2 * c1) / d;
    //     let yi = (a2 * c1 - a1 * c2) / d;
    //
    //     this.element.style.top = yi - this.element.offsetHeight / 2 + 'px';
    //     this.element.style.left = xi - this.element.offsetWidth / 2 + 'px';
    // }

    let width = Math.pow(this.points[1].x - this.points[0].x, 2) + Math.pow(this.points[1].y - this.points[0].y, 2);
    width     = Math.sqrt(width);
    width     = parseFloat(width.toFixed(1));

    if (this.firstRun) {
      this.width = width;
    } else {
      if (this.width - 1.5 < width && width < this.width + 1.5) {
        return;
      }
    }

    this.qr.style.width  = width + 'px';
    this.qr.style.height = width + 'px';

    if (this.firstRun) {
      this.firstRun = false;

      this.namePanel.classList.add('animate');
      this.videoPanel.classList.add('animate');
      this.infoPanel.classList.add('animate');
      this.buttonsPanel.classList.add('animate');

    } else {
      this.namePanel.classList.remove('animate');
      this.videoPanel.classList.remove('animate');
      this.infoPanel.classList.remove('animate');
      this.buttonsPanel.classList.remove('animate');
    }

    this.namePanel.style.width  = width * 3 + 'px';
    this.namePanel.style.height = width + 'px';

    this.videoPanel.style.width = width * 5 + 'px';

    // this.infoPanel.style.width = width * 2.5 + 'px';
    // this.infoPanel.style.padding = 15 + 'px';

    this.buttonsPanel.style.width = width * 5 + 'px';

    this.element.style.top  = this.points[0].y + 'px';
    this.element.style.left = this.points[0].x + 'px';
  }

  getScale() {
    return '';
  }

  getRotate() {
    let angle             = this.__qr.getAngle();
    let x                 = this.display.beta;
    let y                 = this.display.gamma;
    let z                 = this.display.alpha;
    let rad               = Math.atan2(y, x);
    let deg               = rad * (180 / Math.PI);
    let screenOrientation = screen.orientation || screen.mozOrientation || screen.msOrientation;
    let _angle            = screenOrientation.angle || window.orientation || 0;
    deg                   = deg + _angle;
    angle                 = parseFloat(angle.toFixed(1));

    document.getElementById('console').innerText = deg.toString() + ' ' + angle + '     ';

    if (deg >= 0 && deg <= 90) {
      angle = Math.abs(angle) * -1;
    } else {
      angle = Math.abs(angle);
    }

    return 'rotateZ(' + angle + 'deg)';
  }

  transform() {

    let rotate = this.getRotate();

    if (rotate) {
      this.element.style.webkitTransform = rotate;
      this.element.style.mozTransform    = rotate;
      this.element.style.msTransform     = rotate;
      this.element.style.oTransform      = rotate;
      this.element.style.transform       = rotate;
    }
  }
}

window.onload = () => {

  let display     = new Display();
  let transformer = new Transformer(display);

  let lastDetectTime = null;

  let detectCallback = (data) => {
    if (!data.length && lastDetectTime && Date.now() - lastDetectTime > 1500) {
      document.getElementById('content').style.display = 'none';
      return;
    }

    let points = data[0].corners;

    transformer.setPoints(points);
    transformer.run();
    lastDetectTime = Date.now();
  };

  detect().then((info) => {
    initCameraStream(detectCallback);
  });
};