/**
 * ScreenCap Studio - Canvas 2D Graphics Engine & Device Mockup Renderer
 */

window.MockupRenderer = class MockupRenderer {
  constructor(canvasEl) {
    this.canvas = canvasEl;
    this.ctx = canvasEl.getContext('2d');

    // Default Configuration State
    this.state = {
      image: null,
      frame: 'browser', // 'browser', 'iphone', 'macbook', 'card'
      ratio: '16:9',
      gradient: 'aurora',
      customBgColor: '#4f46e5',
      tiltX: 0,
      tiltY: 0,
      padding: 60,
      shadow: 40,
      radius: 16,
      heading: '',
      subheading: ''
    };

    // Aspect Ratio dimensions map
    this.ratiosMap = {
      '16:9': { width: 1920, height: 1080 },
      '1:1': { width: 1080, height: 1080 },
      '9:16': { width: 1080, height: 1920 },
      '4:3': { width: 1600, height: 1200 }
    };

    // Gradient Presets
    this.gradientsMap = {
      aurora: ['#4f46e5', '#ec4899', '#06b6d4'],
      sunset: ['#f59e0b', '#ef4444', '#8b5cf6'],
      midnight: ['#0f172a', '#1e1b4b', '#312e81'],
      emerald: ['#059669', '#10b981', '#06b6d4'],
      dark: ['#18181b', '#27272a', '#09090b']
    };
  }

  updateState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  render() {
    const dims = this.ratiosMap[this.state.ratio] || { width: 1920, height: 1080 };
    this.canvas.width = dims.width;
    this.canvas.height = dims.height;

    const width = this.canvas.width;
    const height = this.canvas.height;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, width, height);

    // 1. Draw Background
    this.drawBackground(ctx, width, height);

    // 2. Draw Text Headlines if any
    let contentTopOffset = 0;
    if (this.state.heading || this.state.subheading) {
      contentTopOffset = this.drawHeadingText(ctx, width);
    }

    // 3. Draw Device Mockup
    if (this.state.image) {
      this.drawDeviceMockup(ctx, width, height, contentTopOffset);
    }
  }

  drawBackground(ctx, w, h) {
    if (this.state.gradient === 'custom') {
      ctx.fillStyle = this.state.customBgColor || '#4f46e5';
      ctx.fillRect(0, 0, w, h);
      return;
    }

    const colors = this.gradientsMap[this.state.gradient] || this.gradientsMap.aurora;
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, colors[0]);
    if (colors.length > 2) grad.addColorStop(0.5, colors[1]);
    grad.addColorStop(1, colors[colors.length - 1]);

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Subtle Noise / Vignette overlay
    const radialGrad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.2, w / 2, h / 2, Math.max(w, h) * 0.8);
    radialGrad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
    radialGrad.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
    ctx.fillStyle = radialGrad;
    ctx.fillRect(0, 0, w, h);
  }

  drawHeadingText(ctx, w) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    let currentY = 70;

    if (this.state.heading) {
      ctx.font = 'bold 54px Outfit, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 16;
      ctx.fillText(this.state.heading, w / 2, currentY);
      currentY += 68;
    }

    if (this.state.subheading) {
      ctx.font = '500 28px Inter, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.shadowBlur = 10;
      ctx.fillText(this.state.subheading, w / 2, currentY);
      currentY += 45;
    }

    ctx.restore();
    return currentY > 70 ? currentY - 50 : 0;
  }

  drawDeviceMockup(ctx, w, h, topOffset = 0) {
    const pad = this.state.padding * 2;
    const availW = w - pad * 2;
    const availH = h - pad * 2 - topOffset;

    const imgAspect = this.state.image.width / this.state.image.height;
    
    let mockW = availW;
    let mockH = mockW / imgAspect;

    if (mockH > availH) {
      mockH = availH;
      mockW = mockH * imgAspect;
    }

    // Restrict mockup size for mobile frame
    if (this.state.frame === 'iphone') {
      mockW = Math.min(mockW, 420);
      mockH = mockW / imgAspect;
    }

    const centerX = w / 2;
    const centerY = h / 2 + topOffset / 2;

    ctx.save();
    ctx.translate(centerX, centerY);

    // Apply 3D Perspective Tilt via Canvas Matrix Transform
    const tiltXRad = (this.state.tiltX * Math.PI) / 180;
    const tiltYRad = (this.state.tiltY * Math.PI) / 180;

    ctx.transform(
      Math.cos(tiltYRad),
      Math.sin(tiltXRad) * 0.25,
      Math.sin(tiltYRad) * 0.25,
      Math.cos(tiltXRad),
      0,
      0
    );

    // Draw Depth Drop Shadow
    const shadowDepth = this.state.shadow * 1.5;
    if (shadowDepth > 0) {
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
      ctx.shadowBlur = shadowDepth * 1.2;
      ctx.shadowOffsetY = shadowDepth;
      ctx.fillStyle = 'rgba(0,0,0,0.9)';
      
      this.drawRoundedRect(ctx, -mockW / 2, -mockH / 2, mockW, mockH, this.state.radius);
      ctx.fill();
      ctx.restore();
    }

    // Render Chosen Device Frame
    switch (this.state.frame) {
      case 'browser':
        this.renderBrowserFrame(ctx, -mockW / 2, -mockH / 2, mockW, mockH);
        break;
      case 'iphone':
        this.renderiPhoneFrame(ctx, -mockW / 2, -mockH / 2, mockW, mockH);
        break;
      case 'macbook':
        this.renderMacBookFrame(ctx, -mockW / 2, -mockH / 2, mockW, mockH);
        break;
      case 'card':
      default:
        this.renderCardFrame(ctx, -mockW / 2, -mockH / 2, mockW, mockH);
        break;
    }

    ctx.restore();
  }

  renderBrowserFrame(ctx, x, y, w, h) {
    const headerH = 38;
    const radius = this.state.radius;

    // Window Frame background
    ctx.save();
    this.drawRoundedRect(ctx, x, y, w, h, radius);
    ctx.fillStyle = '#1e1e24';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Traffic light buttons (Red, Yellow, Green)
    const btnRadius = 5.5;
    const startBtnX = x + 16;
    const btnY = y + headerH / 2;

    ctx.fillStyle = '#ff5f56';
    ctx.beginPath(); ctx.arc(startBtnX, btnY, btnRadius, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#ffbd2e';
    ctx.beginPath(); ctx.arc(startBtnX + 16, btnY, btnRadius, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#27c93f';
    ctx.beginPath(); ctx.arc(startBtnX + 32, btnY, btnRadius, 0, Math.PI * 2); ctx.fill();

    // Browser Address Pill
    const urlW = Math.min(w * 0.5, 360);
    const urlX = x + w / 2 - urlW / 2;
    const urlY = y + 8;
    const urlH = 22;

    this.drawRoundedRect(ctx, urlX, urlY, urlW, urlH, 6);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fill();

    ctx.font = '11px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.textAlign = 'center';
    ctx.fillText('https://screencap.studio', x + w / 2, urlY + 15);

    // Screenshot Clip Area
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y + headerH, w, h - headerH);
    ctx.clip();

    ctx.drawImage(this.state.image, x, y + headerH, w, h - headerH);
    ctx.restore();

    ctx.restore();
  }

  renderiPhoneFrame(ctx, x, y, w, h) {
    const bezel = 12;
    const radius = 36;

    ctx.save();

    // Outer Titanium Chassis
    this.drawRoundedRect(ctx, x - bezel, y - bezel, w + bezel * 2, h + bezel * 2, radius);
    ctx.fillStyle = '#1c1c1e';
    ctx.fill();
    ctx.strokeStyle = '#3a3a3c';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Screen Content
    ctx.save();
    this.drawRoundedRect(ctx, x, y, w, h, radius - bezel / 2);
    ctx.clip();

    ctx.drawImage(this.state.image, x, y, w, h);
    ctx.restore();

    // Dynamic Island Notch
    const islandW = 110;
    const islandH = 26;
    const islandX = x + w / 2 - islandW / 2;
    const islandY = y + 10;

    this.drawRoundedRect(ctx, islandX, islandY, islandW, islandH, 13);
    ctx.fillStyle = '#000000';
    ctx.fill();

    ctx.restore();
  }

  renderMacBookFrame(ctx, x, y, w, h) {
    this.renderBrowserFrame(ctx, x, y, w, h);

    // Aluminum Bottom Lip Chassis
    const lipH = 16;
    const lipW = w + 40;
    const lipX = x - 20;
    const lipY = y + h;

    ctx.save();
    this.drawRoundedRect(ctx, lipX, lipY, lipW, lipH, 4);
    ctx.fillStyle = '#2c2c2e';
    ctx.fill();
    ctx.strokeStyle = '#48484a';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Display Notch indent
    const notchW = 70;
    const notchH = 5;
    this.drawRoundedRect(ctx, x + w / 2 - notchW / 2, lipY, notchW, notchH, 2);
    ctx.fillStyle = '#1c1c1e';
    ctx.fill();

    ctx.restore();
  }

  renderCardFrame(ctx, x, y, w, h) {
    const radius = this.state.radius;

    ctx.save();
    this.drawRoundedRect(ctx, x, y, w, h, radius);
    ctx.clip();

    ctx.drawImage(this.state.image, x, y, w, h);
    ctx.restore();

    // Glass stroke border
    ctx.save();
    this.drawRoundedRect(ctx, x, y, w, h, radius);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  drawRoundedRect(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
};
