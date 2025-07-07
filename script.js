class PresentationSlider {
  constructor() {
    this.currentSlide = 1
    this.totalSlides = 9
    this.isAnimating = false
    this.startX = 0
    this.startY = 0
    this.isVerticalScroll = false

    this.init()
  }

  init() {
    this.bindEvents()
    this.updateUI()
    this.addRippleEffects()
    this.initAnimations()
  }

  bindEvents() {
    // Navigation buttons
    document.getElementById("prevBtn").addEventListener("click", () => this.previousSlide())
    document.getElementById("nextBtn").addEventListener("click", () => this.nextSlide())

    // Slide indicators
    document.querySelectorAll(".indicator").forEach((indicator, index) => {
      indicator.addEventListener("click", () => this.goToSlide(index + 1))
    })

    // Sommaire navigation
    document.querySelectorAll(".sommaire-item-vertical").forEach((item) => {
      item.addEventListener("click", () => {
        const targetSlide = item.getAttribute("data-slide-target")
        if (targetSlide) {
          this.goToSlide(Number.parseInt(targetSlide))
        }
      })
    })

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      // Navigation horizontale
      if (e.key === "ArrowLeft") {
        e.preventDefault()
        this.previousSlide()
      }
      if (e.key === "ArrowRight") {
        e.preventDefault()
        this.nextSlide()
      }
      if (e.key >= "1" && e.key <= "9") {
        e.preventDefault()
        this.goToSlide(Number.parseInt(e.key))
      }
      if (e.key === "Home") {
        e.preventDefault()
        this.goToSlide(1)
      }
      if (e.key === "End") {
        e.preventDefault()
        this.goToSlide(this.totalSlides)
      }
      if (e.key === "Escape") {
        e.preventDefault()
        this.goToSlide(1)
      }
    })

    this.addTouchSupport()
  }

  addTouchSupport() {
    const slidesWrapper = document.querySelector(".slides-wrapper")

    slidesWrapper.addEventListener(
      "touchstart",
      (e) => {
        this.startX = e.touches[0].clientX
        this.startY = e.touches[0].clientY
        this.startTime = Date.now()
        this.isVerticalScroll = false
      },
      { passive: true },
    )

    slidesWrapper.addEventListener(
      "touchmove",
      (e) => {
        if (!this.startX || !this.startY) return

        const currentX = e.touches[0].clientX
        const currentY = e.touches[0].clientY

        const deltaX = Math.abs(currentX - this.startX)
        const deltaY = Math.abs(currentY - this.startY)

        // Priorité au scroll vertical
        if (deltaY > deltaX && deltaY > 10) {
          this.isVerticalScroll = true
          return
        }
      },
      { passive: true },
    )

    slidesWrapper.addEventListener(
      "touchend",
      (e) => {
        if (this.isVerticalScroll) {
          this.resetTouch()
          return
        }

        const endX = e.changedTouches[0].clientX
        const endTime = Date.now()

        const deltaX = endX - this.startX
        const deltaTime = endTime - this.startTime

        // Swipe horizontal pour navigation
        if (Math.abs(deltaX) > 50 && deltaTime < 500) {
          if (deltaX > 0) {
            this.previousSlide()
          } else {
            this.nextSlide()
          }
        }

        this.resetTouch()
      },
      { passive: true },
    )
  }

  resetTouch() {
    this.startX = 0
    this.startY = 0
    this.isVerticalScroll = false
  }

  nextSlide() {
    if (this.isAnimating) return

    if (this.currentSlide < this.totalSlides) {
      this.goToSlide(this.currentSlide + 1)
    }
  }

  previousSlide() {
    if (this.isAnimating) return

    if (this.currentSlide > 1) {
      this.goToSlide(this.currentSlide - 1)
    }
  }

  goToSlide(slideNumber) {
    if (this.isAnimating || slideNumber === this.currentSlide || slideNumber < 1 || slideNumber > this.totalSlides)
      return

    this.isAnimating = true

    const currentSlideElement = document.querySelector(`.slide[data-slide="${this.currentSlide}"]`)
    const targetSlideElement = document.querySelector(`.slide[data-slide="${slideNumber}"]`)

    if (!currentSlideElement || !targetSlideElement) {
      this.isAnimating = false
      return
    }

    // Direction de l'animation
    if (slideNumber > this.currentSlide) {
      currentSlideElement.classList.add("prev")
    } else {
      currentSlideElement.classList.remove("prev")
    }

    currentSlideElement.classList.remove("active")

    setTimeout(() => {
      targetSlideElement.classList.add("active")
      targetSlideElement.classList.remove("prev")

      // Remettre le scroll en haut pour la nouvelle slide
      targetSlideElement.scrollTop = 0

      this.currentSlide = slideNumber
      this.updateUI()
      this.animateSlideContent(targetSlideElement)

      setTimeout(() => {
        this.isAnimating = false
        currentSlideElement.classList.remove("prev")
      }, 600)
    }, 50)
  }

  updateUI() {
    const progressFill = document.getElementById("progressFill")
    if (progressFill) {
      const progressPercentage = (this.currentSlide / this.totalSlides) * 100
      progressFill.style.width = `${progressPercentage}%`
    }

    const prevBtn = document.getElementById("prevBtn")
    const nextBtn = document.getElementById("nextBtn")

    if (prevBtn) prevBtn.disabled = this.currentSlide === 1
    if (nextBtn) nextBtn.disabled = this.currentSlide === this.totalSlides

    document.querySelectorAll(".indicator").forEach((indicator, index) => {
      indicator.classList.toggle("active", index + 1 === this.currentSlide)
    })
  }

  initAnimations() {
    // Appliquer les délais d'animation aux éléments de liste
    document.querySelectorAll(".slide").forEach((slide) => {
      const listItems = slide.querySelectorAll(".list-item-animate")
      listItems.forEach((item, index) => {
        item.style.animationDelay = `${0.5 + index * 0.1}s`
      })
    })
  }

  animateSlideContent(slide) {
    const elementsToAnimate = [
      slide.querySelector(".slide-icon i"),
      slide.querySelector(".slide-title"),
      slide.querySelector(".slide-text"),
    ]

    // Réinitialiser et relancer les animations pour les éléments principaux
    elementsToAnimate.forEach((el) => {
      if (el) {
        el.style.animation = "none"
        el.offsetHeight // Trigger reflow
        el.style.animation = null
      }
    })

    // Animer les éléments de liste avec délais
    const listItems = slide.querySelectorAll(".list-item-animate")
    listItems.forEach((item, index) => {
      item.style.animation = "none"
      item.offsetHeight // Trigger reflow
      item.style.animation = null
      item.style.animationDelay = `${0.5 + index * 0.1}s`
    })

    // Animer les éléments du sommaire
    const sommaireItems = slide.querySelectorAll(".sommaire-item-vertical")
    sommaireItems.forEach((item, index) => {
      item.style.animation = "none"
      item.offsetHeight // Trigger reflow
      item.style.animation = null
      item.style.animationDelay = `${0.1 + index * 0.1}s`
    })

    // Animer les images du bas
    const bottomImages = slide.querySelectorAll(".image-placeholder")
    bottomImages.forEach((image, index) => {
      image.style.animation = "none"
      image.offsetHeight // Trigger reflow
      image.style.animation = null
      image.style.animationDelay = `${0.3 + index * 0.2}s`
    })
  }

  addRippleEffects() {
    const addRippleEffect = (element) => {
      element.addEventListener("click", function (e) {
        const ripple = document.createElement("span")
        const rect = this.getBoundingClientRect()
        const size = Math.max(rect.width, rect.height)
        const x = e.clientX - rect.left - size / 2
        const y = e.clientY - rect.top - size / 2

        ripple.style.width = ripple.style.height = size + "px"
        ripple.style.left = x + "px"
        ripple.style.top = y + "px"
        ripple.classList.add("ripple")

        this.appendChild(ripple)

        setTimeout(() => {
          ripple.remove()
        }, 600)
      })
    }

    // Appliquer l'effet ripple
    document.querySelectorAll(".nav-btn, .indicator, .sommaire-item-vertical").forEach(addRippleEffect)
  }
}

// Initialisation
document.addEventListener("DOMContentLoaded", () => {
  const presentation = new PresentationSlider()

  // Animation d'entrée
  document.body.style.opacity = "0"
  setTimeout(() => {
    document.body.style.transition = "opacity 0.5s ease"
    document.body.style.opacity = "1"
  }, 100)

  // Messages de debug
  console.log("🎯 Navigation disponible:")
  console.log("← → : Navigation entre slides")
  console.log("↑ ↓ : Scroll naturel dans le contenu")
  console.log("1-9 : Accès direct aux slides")
  console.log("Home/End : Première/Dernière slide")
  console.log("Escape : Retour à la première slide")
  console.log("Molette : Scroll naturel")
  console.log("Swipe horizontal : Navigation")
  console.log("Swipe vertical : Scroll")
  console.log("Clic sur sommaire : Navigation directe")
  console.log("🚀 Présentation optimisée prête !")
})
