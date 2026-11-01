/**
 * IMAGE SLIDER MANAGER
 * Handles responsive image carousels with touch support
 */
class SliderManager {
  constructor() {
    this.track = document.getElementById('sliderTrack');
    this.prevBtn = document.getElementById('prevBtn');
    this.nextBtn = document.getElementById('nextBtn');
    this.dotsContainer = document.getElementById('dotsContainer');
    
    this.currentIndex = 0;
    this.itemsPerView = this.getItemsPerView();
    this.items = this.track?.querySelectorAll('.slider-item') || [];
    this.totalItems = this.items.length;
    
    this.init();
  }

  getItemsPerView() {
    const width = window.innerWidth;
    if (width < 640) return 2;
    if (width < 1024) return 3;
    return 4;
  }

  init() {
    if (!this.track) return;
    this.createDots();
    this.attachEventListeners();
    this.updateSlider();
    this.handleResize();
  }

  createDots() {
    if (!this.dotsContainer) return;
    this.dotsContainer.innerHTML = '';
    const numDots = Math.ceil(this.totalItems / this.itemsPerView);
    
    for (let i = 0; i < numDots; i++) {
      const dot = document.createElement('button');
      dot.className = 'slider-dot';
      if (i === 0) dot.classList.add('active');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => this.goToSlide(i * this.itemsPerView));
      this.dotsContainer.appendChild(dot);
    }
  }

  attachEventListeners() {
    if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.prev());
    if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.next());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === 'ArrowRight') this.next();
    });

    let startX = 0;
    if (this.track) {
      this.track.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
      });

      this.track.addEventListener('touchend', (e) => {
        const endX = e.changedTouches[0].clientX;
        if (startX - endX > 50) this.next();
        if (endX - startX > 50) this.prev();
      });
    }
  }

  prev() {
    this.currentIndex = Math.max(0, this.currentIndex - 1);
    this.updateSlider();
  }

  next() {
    const maxIndex = Math.max(0, this.totalItems - this.itemsPerView);
    this.currentIndex = Math.min(maxIndex, this.currentIndex + 1);
    this.updateSlider();
  }

  goToSlide(index) {
    this.currentIndex = Math.max(0, Math.min(index, this.totalItems - this.itemsPerView));
    this.updateSlider();
  }

  updateSlider() {
    if (!this.track || !this.items.length) return;

    const itemWidth = this.items[0].offsetWidth + 18;
    const scrollAmount = this.currentIndex * itemWidth;
    this.track.style.transform = `translateX(-${scrollAmount}px)`;

    this.items.forEach((item, index) => {
      const isVisible = index >= this.currentIndex && index < this.currentIndex + this.itemsPerView;
      item.classList.toggle('active', isVisible);
    });

    this.updateDots();
    this.updateButtons();
  }

  updateDots() {
    const dots = this.dotsContainer?.querySelectorAll('.slider-dot') || [];
    const dotIndex = Math.ceil(this.currentIndex / this.itemsPerView);
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === dotIndex);
    });
  }

  updateButtons() {
    if (this.prevBtn) this.prevBtn.disabled = this.currentIndex === 0;
    if (this.nextBtn) {
      const maxIndex = Math.max(0, this.totalItems - this.itemsPerView);
      this.nextBtn.disabled = this.currentIndex >= maxIndex;
    }
  }

  handleResize() {
    window.addEventListener('resize', () => {
      const newItemsPerView = this.getItemsPerView();
      if (newItemsPerView !== this.itemsPerView) {
        this.itemsPerView = newItemsPerView;
        this.currentIndex = 0;
        this.createDots();
        this.updateSlider();
      }
    });
  }
}

/**
 * VIDEO SLIDER MANAGER
 * Handles responsive video carousels with full-width mobile-first design
 */
class VideoSliderManager {
  constructor() {
    this.track = document.getElementById('videoTrack');
    this.prevBtn = document.getElementById('videoPrevBtn');
    this.nextBtn = document.getElementById('videoNextBtn');
    this.dotsContainer = document.getElementById('videoDotsContainer');
    
    this.currentIndex = 0;
    this.items = this.track?.querySelectorAll('.video-item') || [];
    this.totalItems = this.items.length;
    this.isMobile = window.innerWidth < 1024;
    
    this.init();
  }

  init() {
    if (!this.track) return;
    this.createDots();
    this.attachEventListeners();
    this.updateSlider();
    this.handleResize();
  }

  createDots() {
    if (!this.dotsContainer) return;
    this.dotsContainer.innerHTML = '';
    
    for (let i = 0; i < this.totalItems; i++) {
      const dot = document.createElement('button');
      dot.className = 'slider-dot';
      if (i === 0) dot.classList.add('active');
      dot.setAttribute('aria-label', `Go to video ${i + 1}`);
      dot.addEventListener('click', () => this.goToSlide(i));
      this.dotsContainer.appendChild(dot);
    }
  }

  attachEventListeners() {
    if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.prev());
    if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.next());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === 'ArrowRight') this.next();
    });

    let startX = 0;
    if (this.track) {
      this.track.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
      });

      this.track.addEventListener('touchend', (e) => {
        const endX = e.changedTouches[0].clientX;
        if (startX - endX > 50) this.next();
        if (endX - startX > 50) this.prev();
      });
    }
  }

  prev() {
    this.currentIndex = Math.max(0, this.currentIndex - 1);
    this.updateSlider();
    this.pauseOtherVideos();
  }

  next() {
    this.currentIndex = Math.min(this.totalItems - 1, this.currentIndex + 1);
    this.updateSlider();
    this.pauseOtherVideos();
  }

  goToSlide(index) {
    this.currentIndex = Math.max(0, Math.min(index, this.totalItems - 1));
    this.updateSlider();
    this.pauseOtherVideos();
  }

  updateSlider() {
    if (!this.track || !this.items.length) return;

    const itemWidth = this.track.offsetWidth;
    const scrollAmount = this.currentIndex * itemWidth;
    this.track.style.transform = `translateX(-${scrollAmount}px)`;

    this.items.forEach((item, index) => {
      item.classList.toggle('active', index === this.currentIndex);
    });

    this.updateDots();
    this.updateButtons();
  }

  updateDots() {
    const dots = this.dotsContainer?.querySelectorAll('.slider-dot') || [];
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentIndex);
    });
  }

  updateButtons() {
    if (this.prevBtn) this.prevBtn.disabled = this.currentIndex === 0;
    if (this.nextBtn) this.nextBtn.disabled = this.currentIndex >= this.totalItems - 1;
  }

  pauseOtherVideos() {
    this.items.forEach((item, index) => {
      const video = item.querySelector('video');
      if (index !== this.currentIndex && video) {
        video.pause();
      }
    });
  }

  handleResize() {
    window.addEventListener('resize', () => {
      const newIsMobile = window.innerWidth < 1024;
      if (newIsMobile !== this.isMobile) {
        this.isMobile = newIsMobile;
        this.updateSlider();
      }
    });
  }
}

// Initialize both sliders when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize image slider if it exists
  if (document.getElementById('sliderTrack')) {
    new SliderManager();
  }
  
  // Initialize video slider if it exists
  if (document.getElementById('videoTrack')) {
    new VideoSliderManager();
  }
});