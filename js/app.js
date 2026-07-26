/**
 * ScreenCap Studio - Main Application Orchestrator
 */

class ScreenCapApp {
  constructor() {
    this.canvas = document.getElementById('main-canvas');
    this.renderer = new window.MockupRenderer(this.canvas);

    // Controls DOM References
    this.fileDropzone = document.getElementById('file-dropzone');
    this.imageFileInput = document.getElementById('image-file-input');
    this.stageResText = document.getElementById('stage-resolution-text');
    this.exportPngBtn = document.getElementById('export-png-btn');
    this.resetSlidersBtn = document.getElementById('btn-reset-sliders');

    // Text inputs
    this.inputHeading = document.getElementById('input-heading');
    this.inputSubheading = document.getElementById('input-subheading');

    // Sliders
    this.sliderTiltX = document.getElementById('slider-tilt-x');
    this.sliderTiltY = document.getElementById('slider-tilt-y');
    this.sliderPadding = document.getElementById('slider-padding');
    this.sliderShadow = document.getElementById('slider-shadow');
    this.sliderRadius = document.getElementById('slider-radius');

    // Value Labels
    this.valTiltX = document.getElementById('val-tilt-x');
    this.valTiltY = document.getElementById('val-tilt-y');
    this.valPadding = document.getElementById('val-padding');
    this.valShadow = document.getElementById('val-shadow');
    this.valRadius = document.getElementById('val-radius');

    this.init();
  }

  init() {
    this.bindUploadListeners();
    this.bindFramePickers();
    this.bindRatioPickers();
    this.bindGradientPickers();
    this.bindSliders();
    this.bindTextInputs();
    this.bindExport();

    // Load initial sample mockup
    this.loadSampleImage('dashboard');
  }

  loadSampleImage(type) {
    const sampleCanvas = document.createElement('canvas');
    const ctx = sampleCanvas.getContext('2d');

    if (type === 'mobile') {
      sampleCanvas.width = 600;
      sampleCanvas.height = 1200;
      this.drawMobileSample(ctx, 600, 1200);
    } else if (type === 'code') {
      sampleCanvas.width = 1200;
      sampleCanvas.height = 800;
      this.drawCodeSample(ctx, 1200, 800);
    } else {
      sampleCanvas.width = 1400;
      sampleCanvas.height = 900;
      this.drawDashboardSample(ctx, 1400, 900);
    }

    const img = new Image();
    img.onload = () => {
      this.renderer.updateState({ image: img });
    };
    img.src = sampleCanvas.toDataURL();
  }

  drawDashboardSample(ctx, w, h) {
    // Dark App Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // Sidebar
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 240, h);

    // Header
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(240, 0, w - 240, 64);

    // Chart Cards
    ctx.fillStyle = '#1e293b';
    ctx.roundRect(280, 100, 500, 320, 16); ctx.fill();
    ctx.roundRect(820, 100, 500, 320, 16); ctx.fill();

    // Line Chart Simulation
    ctx.beginPath();
    ctx.moveTo(320, 340);
    ctx.bezierCurveTo(400, 220, 500, 380, 600, 240);
    ctx.bezierCurveTo(680, 180, 720, 280, 750, 200);
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Bar Chart Simulation
    ctx.fillStyle = '#10b981';
    [860, 920, 980, 1040, 1100, 1160, 1220].forEach((x, i) => {
      const barH = 60 + (i * 35) % 180;
      ctx.fillRect(x, 380 - barH, 36, barH);
    });

    // Data Table
    ctx.fillStyle = '#1e293b';
    ctx.roundRect(280, 460, 1040, 380, 16); ctx.fill();

    ctx.fillStyle = '#334155';
    ctx.fillRect(310, 500, 980, 2);
    ctx.fillRect(310, 580, 980, 2);
    ctx.fillRect(310, 660, 980, 2);
    ctx.fillRect(310, 740, 980, 2);
  }

  drawMobileSample(ctx, w, h) {
    ctx.fillStyle = '#090a0f';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(0, 0, w, 280);

    ctx.font = 'bold 36px Outfit, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('ScreenCap Mobile', 40, 120);

    ctx.fillStyle = '#1a1e2b';
    ctx.roundRect(40, 320, w - 80, 180, 16); ctx.fill();
    ctx.roundRect(40, 540, w - 80, 180, 16); ctx.fill();
    ctx.roundRect(40, 760, w - 80, 180, 16); ctx.fill();
  }

  drawCodeSample(ctx, w, h) {
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, w, h);

    ctx.font = '24px Fira Code, monospace';
    ctx.fillStyle = '#ff7b72';
    ctx.fillText('import', 60, 100);

    ctx.fillStyle = '#79c0ff';
    ctx.fillText(' { MockupRenderer } ', 150, 100);

    ctx.fillStyle = '#ff7b72';
    ctx.fillText('from', 440, 100);

    ctx.fillStyle = '#a5d6ff';
    ctx.fillText(' "./renderer.js";', 520, 100);

    ctx.fillStyle = '#8b949e';
    ctx.fillText('// Initialize 4K Canvas Marketing Engine', 60, 160);

    ctx.fillStyle = '#d2a8ff';
    ctx.fillText('const renderer = new MockupRenderer(canvas);', 60, 220);
    ctx.fillText('renderer.updateState({ ratio: "16:9", frame: "browser" });', 60, 280);
  }

  bindUploadListeners() {
    const processFile = (file) => {
      if (!file || !file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          this.renderer.updateState({ image: img });
          this.showToast('Imagen cargada con éxito', 'fa-check');
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    };

    this.imageFileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) processFile(e.target.files[0]);
    });

    this.fileDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.fileDropzone.style.borderColor = 'var(--accent-primary)';
    });

    this.fileDropzone.addEventListener('dragleave', () => {
      this.fileDropzone.style.borderColor = 'var(--border-color)';
    });

    this.fileDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.fileDropzone.style.borderColor = 'var(--border-color)';
      if (e.dataTransfer.files.length > 0) processFile(e.dataTransfer.files[0]);
    });

    // Sample Picker Buttons
    const sampleBtns = document.querySelectorAll('.btn-sample');
    sampleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sampleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadSampleImage(btn.dataset.sample);
      });
    });
  }

  bindFramePickers() {
    const frameCards = document.querySelectorAll('.picker-card');
    frameCards.forEach(card => {
      card.addEventListener('click', () => {
        frameCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.renderer.updateState({ frame: card.dataset.frame });
      });
    });
  }

  bindRatioPickers() {
    const ratioBtns = document.querySelectorAll('.ratio-btn');
    ratioBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        ratioBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const ratio = btn.dataset.ratio;
        const dims = this.renderer.ratiosMap[ratio];
        this.stageResText.textContent = `${dims.width} × ${dims.height} px (${ratio})`;

        this.renderer.updateState({ ratio });
      });
    });
  }

  bindGradientPickers() {
    const dots = document.querySelectorAll('.gradient-dot');
    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        dots.forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        this.renderer.updateState({ gradient: dot.dataset.grad });
      });
    });

    const colorPicker = document.getElementById('bg-color-picker');
    colorPicker.addEventListener('input', (e) => {
      dots.forEach(d => d.classList.remove('active'));
      this.renderer.updateState({
        gradient: 'custom',
        customBgColor: e.target.value
      });
    });
  }

  bindSliders() {
    this.sliderTiltX.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      this.valTiltX.textContent = `${val}°`;
      this.renderer.updateState({ tiltX: val });
    });

    this.sliderTiltY.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      this.valTiltY.textContent = `${val}°`;
      this.renderer.updateState({ tiltY: val });
    });

    this.sliderPadding.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      this.valPadding.textContent = `${val}px`;
      this.renderer.updateState({ padding: val });
    });

    this.sliderShadow.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      this.valShadow.textContent = `${val}px`;
      this.renderer.updateState({ shadow: val });
    });

    this.sliderRadius.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      this.valRadius.textContent = `${val}px`;
      this.renderer.updateState({ radius: val });
    });

    this.resetSlidersBtn.addEventListener('click', () => {
      this.sliderTiltX.value = 0;
      this.sliderTiltY.value = 0;
      this.sliderPadding.value = 60;
      this.sliderShadow.value = 40;
      this.sliderRadius.value = 16;

      this.valTiltX.textContent = '0°';
      this.valTiltY.textContent = '0°';
      this.valPadding.textContent = '60px';
      this.valShadow.textContent = '40px';
      this.valRadius.textContent = '16px';

      this.renderer.updateState({
        tiltX: 0,
        tiltY: 0,
        padding: 60,
        shadow: 40,
        radius: 16
      });
    });
  }

  bindTextInputs() {
    this.inputHeading.addEventListener('input', (e) => {
      this.renderer.updateState({ heading: e.target.value });
    });

    this.inputSubheading.addEventListener('input', (e) => {
      this.renderer.updateState({ subheading: e.target.value });
    });
  }

  bindExport() {
    this.exportPngBtn.addEventListener('click', () => {
      const dataURL = this.canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = `screencap-mockup-${new Date().toISOString().slice(0, 10)}.png`;
      link.click();

      this.showToast('Imagen 4K descargada', 'fa-download');
    });
  }

  showToast(message, icon = 'fa-info-circle') {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> ${message}`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }
}

// Initialize Application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.screencapApp = new ScreenCapApp();
});
