(function() {
  const recordButton = document.getElementById('button');
  const buttonHead = document.getElementById('head');

  let analyser;
  const initialize = () => {
    if (analyser) return;
    navigator.mediaDevices.getUserMedia({audio: true}).then(stream => {
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

  const bars = [12.56640625,11.70703125,13.107421875,64.16015625,77.431640625,75.91796875,54.48046875,29.9921875,13.5703125,4.673828125,2.58984375,11.0546875,10.15234375,67.25390625,57.966796875,35.634765625,16.876953125,13.265625,12.08203125,13.7734375,68.455078125,68.0546875,67.654296875,45.087890625,25.474609375,13.958984375,13.458984375,9.0390625,5.984375,12.1875];
  const processInput = () => {
    if (analyser && active) {
      const array = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(array);
      const sum = array.reduce((a,b) => a + b);
      const average = sum / array.length;
      bars.push(average);
      if (bars.length > 30) {
        bars.splice(0, bars.length - 30);
      }
      renderBars();
    }
  }
  setInterval(processInput, 50);

  const svg = document.querySelector('#waveform svg');
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
    let max = Math.max(...bars);
    if (max > 0) {
      bars.forEach((bar, i) => {
        let rect = rects[i];
        let height = bar / max * 200;
        rect.setAttribute("height", height);
        rect.setAttribute("y", 540 - height / 2);
      });
    }
  }
  renderBars();

  recordButton.addEventListener('click', toggleRecording);
  recordButton.addEventListener('mousedown', () => {
    buttonHead.setAttribute('transform', 'translate(0 20)');
  });
  recordButton.addEventListener('mouseup', () => {
    buttonHead.removeAttribute('transform');
  });
})();
