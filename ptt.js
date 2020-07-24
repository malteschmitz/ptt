(function () {
  let AudioContext = window.AudioContext || window.webkitAudioContext;

  let analyser;
  const initialize = () => {
    if (analyser) return;
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      const audioContext = new AudioContext();
      const input = audioContext.createMediaStreamSource(stream);
      analyser = audioContext.createAnalyser();
      analyser.smoothingTimeConstant = 0.3;
      analyser.fftSize = 1024;
      input.connect(analyser);
    }, () => {
      console.error('Error requesting microphone.');
    });
  }

  let active = false;
  const toggleRecording = () => {
    active = !active;
    if (active) {
      initialize();
    }
  }

  const bars = [12.56640625, 11.70703125, 13.107421875, 64.16015625, 77.431640625, 75.91796875, 54.48046875, 29.9921875, 13.5703125, 4.673828125, 2.58984375, 11.0546875, 10.15234375, 67.25390625, 57.966796875, 35.634765625, 16.876953125, 13.265625, 12.08203125, 13.7734375, 68.455078125, 68.0546875, 67.654296875, 45.087890625, 25.474609375, 13.958984375, 13.458984375, 9.0390625, 5.984375, 12.1875];
  const processInput = () => {
    if (analyser && active) {
      const array = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(array);
      const sum = array.reduce((a, b) => a + b);
      const average = sum / array.length;
      bars.push(average);
      if (bars.length > 30) {
        bars.splice(0, bars.length - 30);
      }
      renderBars();
    }
  }
  setInterval(processInput, 50);

  const svg = document.querySelector('#wave');
  for (let i = 0; i < 30; i++) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute("width", "12");
    rect.setAttribute("height", "0");
    rect.setAttribute("x", 755 + 25 * i);
    rect.setAttribute("y", "0");
    rect.setAttribute("fill", "#F0F0F0");
    rect.setAttribute("class", "bar");
    svg.appendChild(rect);
  }

  const renderBars = () => {
    let rects = svg.querySelectorAll('rect.bar');
    let max = Math.max(1, ...bars);
    bars.forEach((bar, i) => {
      let rect = rects[i];
      let height = bar / max * 200;
      rect.setAttribute("height", height);
      rect.setAttribute("y", 540 - height / 2);
    });
  }
  renderBars();

  const recordButton = document.getElementById('button');
  const buttonHead = document.getElementById('head');
  recordButton.addEventListener('click', toggleRecording);
  recordButton.addEventListener('mousedown', () => {
    buttonHead.setAttribute('transform', 'translate(0 20)');
  });
  recordButton.addEventListener('mouseup', () => {
    buttonHead.removeAttribute('transform');
  });

  const colors = [
    {
      gradient: [
        { offset: 0, color: "#4D99B2" },
        { offset: 0.3765, color: "#56A5BA" },
        { offset: 1, color: "#6DC4CE" }
      ],
      head: "#1A8097"
    }, {
      gradient: [
        { offset: 0, color: "#fe2b20" },
        { offset: 0.7, color: "#fd5d54" },
        { offset: 1, color: "#ec6058" }
      ],
      head: "#bb1c14"
    }, {
      gradient: [
        { offset: 0, color: "#028d0d" },
        { offset: 0.7, color: "#04ad12" },
        { offset: 1, color: "#00ad2e" },
      ],
      head: "#00770b"
    }, {
      gradient: [
        { offset: 0, color: "#6f6397" },
        { offset: 0.7, color: "#695994" },
        { offset: 1, color: "#8377ac" },
      ],
      head: "#57478d"
    }, {
      gradient: [
        { offset: 0, color: "#eb9b19" },
        { offset: 0.3765, color: "#feaf09" },
        { offset: 1, color: "#ffb93a" },
      ],
      head: "#e98f11"
    }
  ];
  let colorIndex = 0;

  const nextColorButton = document.getElementById('nextColor');
  nextColorButton.addEventListener('click', () => {
    colorIndex = (colorIndex + 1) % colors.length;
    const color = colors[colorIndex];
    const gradient = svg.getElementById('gradient');
    gradient.querySelectorAll('stop').forEach((stop, i) => {
      stop.setAttribute('offset', color.gradient[i].offset);
      stop.setAttribute('stop-color', color.gradient[i].color);
    });
    buttonHead.setAttribute('fill', color.head);
  });

  const getSvgDataUrl = () => {
    const container = document.getElementById('container');
    return 'data:image/svg+xml,' + encodeURIComponent(container.innerHTML);
  }

  const getPngDataUrl = (callback) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
        ctx.drawImage(img, 0, 0);
        const png = canvas.toDataURL("image/png");  
        callback(png);
    };
    img.src = getSvgDataUrl();
  }

  const downloadUrl = (url, filename, done) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      if (done) {
        done();
      }
    });
  }

  const downloadSvgButton = document.getElementById('downloadSvg');
  downloadSvgButton.addEventListener('click', () => {
    const url = getSvgDataUrl();
    downloadUrl(url, "ptt.svg");
  });

  const downloadPngButton = document.getElementById('downloadPng');
  downloadPngButton.addEventListener('click', () => {
    getPngDataUrl(url => downloadUrl(url, "ptt.png", () => URL.revokeObjectURL(url)));
  });

})();
