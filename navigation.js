class DeckNavigator {
  constructor() {
    this.slides = document.querySelectorAll('.slide');
    this.currentSlide = 0;
    this.totalSlides = this.slides.length;
    this.progressDotsContainer = document.getElementById('progressDots');
    this.currentSlideSpan = document.getElementById('currentSlide');
    this.totalSlidesSpan = document.getElementById('totalSlides');
    
    this.init();
  }

  init() {
    this.createProgressDots();
    this.attachEventListeners();
    this.showSlide(0);
  }

  createProgressDots() {
    if (!this.progressDotsContainer) return;
    this.progressDotsContainer.innerHTML = '';
    
    for (let i = 0; i < this.totalSlides; i++) {
      const dot = document.createElement('button');
      dot.className = 'dot';
      if (i === 0) dot.classList.add('active');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => this.showSlide(i));
      this.progressDotsContainer.appendChild(dot);
    }
  }

  attachEventListeners() {
    const prevBtn = document.querySelector('.nav-btn.prev-slide');
    const nextBtn = document.querySelector('.nav-btn.next-slide');
    
    if (prevBtn) prevBtn.addEventListener('click', () => this.prev());
    if (nextBtn) nextBtn.addEventListener('click', () => this.next());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' && !this.isInSlider()) this.prev();
      if (e.key === 'ArrowRight' && !this.isInSlider()) this.next();
      if (e.key === ' ') {
        e.preventDefault();
        this.next();
      }
    });

    document.addEventListener('wheel', (e) => {
      if (e.deltaY > 0) this.next();
      if (e.deltaY < 0) this.prev();
    }, { passive: true });
  }

  isInSlider() {
    // Don't allow main navigation when in image slider (slide 2) or video slider (slide 3)
    return this.currentSlide === 2 || this.currentSlide === 3;
  }

  showSlide(n) {
    if (n >= this.totalSlides) this.currentSlide = this.totalSlides - 1;
    else if (n < 0) this.currentSlide = 0;
    else this.currentSlide = n;

    this.slides.forEach(slide => slide.classList.remove('active'));
    if (this.slides[this.currentSlide]) this.slides[this.currentSlide].classList.add('active');

    this.updateDots();
    this.updateCounter();
    this.updateButtons();
  }

  updateDots() {
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentSlide);
    });
  }

  updateCounter() {
    if (this.currentSlideSpan) this.currentSlideSpan.textContent = this.currentSlide + 1;
  }

  updateButtons() {
    const prevBtn = document.querySelector('.nav-btn.prev-slide');
    const nextBtn = document.querySelector('.nav-btn.next-slide');
    if (prevBtn) prevBtn.disabled = this.currentSlide === 0;
    if (nextBtn) nextBtn.disabled = this.currentSlide === this.totalSlides - 1;
  }

  prev() { this.showSlide(this.currentSlide - 1); }
  next() { this.showSlide(this.currentSlide + 1); }
  goToSlide(n) { this.showSlide(n); }
}

document.addEventListener('DOMContentLoaded', () => {
  new DeckNavigator();
});

document.addEventListener('keydown', (e) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
    e.preventDefault();
  }
}, false);