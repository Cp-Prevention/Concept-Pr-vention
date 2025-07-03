class PresentationSlider {
  constructor() {
    this.currentSlide = 1
    this.totalSlides = 6
    this.isAnimating = false

    this.init()
  }

  init() {
    this.bindEvents()
    this.updateUI()
    this.addRippleEffects()
  }

  bindEvents() {
    // Navigation buttons
    document.getElementById("prevBtn").addEventListener("click", () => this.previousSlide())
    document.getElementById("nextBtn").addEventListener("click", () => this.nextSlide())

    // Slide indicators
    document.querySelectorAll(".indicator").forEach((indicator, index) => {
      indicator.addEventListener("click", () => this.goToSlide(index + 1))
    })

    // Keyboard navigation - SEULEMENT pour navigation horizontale
    document.addEventListener("keydown", (e) => {
      // Navigation horizontale SEULEMENT
      if (e.key === "ArrowLeft") {
        e.preventDefault()
        this.previousSlide()
      }
      if (e.key === "ArrowRight") {
        e.preventDefault()
        this.nextSlide()
      }
      if (e.key >= "1" && e.key <= "6") {
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

      // LAISSER les flèches haut/bas pour le scroll naturel
      // Ne pas intercepter ArrowUp et ArrowDown
    })

    this.addTouchSupport()
  }

  addTouchSupport() {
    let startX = 0
    let startY = 0
    let startTime = 0
    let isVerticalScroll = false

    const slidesWrapper = document.querySelector(".slides-wrapper")

    slidesWrapper.addEventListener(
      "touchstart",
      (e) => {
        startX = e.touches[0].clientX
        startY = e.touches[0].clientY
        startTime = Date.now()
        isVerticalScroll = false
      },
      { passive: true },
    )

    slidesWrapper.addEventListener(
      "touchmove",
      (e) => {
        if (!startX || !startY) return

        const currentX = e.touches[0].clientX
        const currentY = e.touches[0].clientY

        const deltaX = Math.abs(currentX - startX)
        const deltaY = Math.abs(currentY - startY)

        // Priorité au scroll vertical
        if (deltaY > 5) {
          isVerticalScroll = true
          return // Laisser le scroll natif
        }
      },
      { passive: true },
    )

    slidesWrapper.addEventListener(
      "touchend",
      (e) => {
        if (isVerticalScroll) {
          startX = 0
          startY = 0
          isVerticalScroll = false
          return
        }

        const endX = e.changedTouches[0].clientX
        const endTime = Date.now()

        const deltaX = endX - startX
        const deltaTime = endTime - startTime

        // Swipe horizontal pour navigation
        if (Math.abs(deltaX) > 100 && deltaTime < 400) {
          if (deltaX > 0) {
            this.previousSlide()
          } else {
            this.nextSlide()
          }
        }

        startX = 0
        startY = 0
        isVerticalScroll = false
      },
      { passive: true },
    )
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
    const progressPercentage = (this.currentSlide / this.totalSlides) * 100
    progressFill.style.width = `${progressPercentage}%`

    const prevBtn = document.getElementById("prevBtn")
    const nextBtn = document.getElementById("nextBtn")

    prevBtn.disabled = this.currentSlide === 1
    nextBtn.disabled = this.currentSlide === this.totalSlides

    document.querySelectorAll(".indicator").forEach((indicator, index) => {
      indicator.classList.toggle("active", index + 1 === this.currentSlide)
    })
  }

  animateSlideContent(slide) {
    const icon = slide.querySelector(".slide-icon i")
    const title = slide.querySelector(".slide-title")
    const text = slide.querySelector(".slide-text")
    const listItems = slide.querySelectorAll(".slide-text li")
    ;[icon, title, text].forEach((el) => {
      if (el) {
        el.style.animation = "none"
        el.offsetHeight // Trigger reflow
        el.style.animation = null
      }
    })

    listItems.forEach((item, index) => {
      item.style.animation = "none"
      item.offsetHeight // Trigger reflow
      item.style.animation = null
      item.style.animationDelay = `${0.5 + index * 0.1}s`
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

    document.querySelectorAll(".nav-btn, .indicator").forEach(addRippleEffect)
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const presentation = new PresentationSlider()

  document.body.style.opacity = "0"
  setTimeout(() => {
    document.body.style.transition = "opacity 0.5s ease"
    document.body.style.opacity = "1"
  }, 100)

  console.log("Navigation disponible:")
  console.log("← → : Navigation entre slides")
  console.log("↑ ↓ : Scroll naturel dans le contenu")
  console.log("1-6 : Accès direct aux slides")
  console.log("Molette : Scroll naturel")
  console.log("Swipe horizontal : Navigation")
  console.log("Swipe vertical : Scroll")
})
