(() => {
  const deck = document.getElementById('deck')
  const slides = [...document.querySelectorAll('.slide')]
  const previous = document.getElementById('previous')
  const next = document.getElementById('next')
  const autoplay = document.getElementById('autoplay')
  const fullscreen = document.getElementById('fullscreen')
  const announcer = document.getElementById('announcer')
  const overview = document.getElementById('overview')
  const help = document.getElementById('help')
  let current = Math.min(17, Math.max(0, Number(location.hash.slice(1)) - 1 || 0))
  let playing = false
  let timer = 0
  let touchX = 0
  let touchY = 0

  function fit() {
    deck.style.setProperty('--scale', String(Math.min(innerWidth / 1440, innerHeight / 810)))
  }

  function goTo(index, userInitiated = true) {
    index = Math.max(0, Math.min(slides.length - 1, index))
    if (index === current && slides[index].classList.contains('is-active')) return
    const old = slides[current]
    const slide = slides[index]
    deck.dataset.direction = index < current ? 'back' : 'forward'
    if (old && old !== slide) {
      if (old.contains(document.activeElement)) slide.querySelector('[tabindex="-1"]')?.focus({ preventScroll: true })
      old.classList.remove('is-active')
      old.classList.add('is-leaving')
      old.inert = true
      setTimeout(() => old.classList.remove('is-leaving'), 560)
    }
    current = index
    slide.inert = false
    slide.classList.add('is-active')
    deck.dataset.current = String(current)
    document.getElementById('section-label').textContent = slide.dataset.section
    document.getElementById('page-count').textContent = `${String(current + 1).padStart(2, '0')} / 18`
    document.getElementById('progress-fill').style.width = `${(current + 1) / slides.length * 100}%`
    previous.disabled = current === 0
    next.disabled = current === slides.length - 1
    history.replaceState(null, '', `#${current + 1}`)
    announcer.textContent = `第 ${current + 1} 页，共 18 页：${slide.dataset.title}`
    document.querySelectorAll('.overview-item').forEach((button, i) => {
      if (i === current) button.setAttribute('aria-current', 'page')
      else button.removeAttribute('aria-current')
    })
    if (userInitiated && playing) restartTimer()
    if (current === slides.length - 1 && playing) stopAutoplay()
  }

  function restartTimer() {
    clearTimeout(timer)
    timer = setTimeout(() => goTo(current + 1, false), 9000)
  }

  function startAutoplay() {
    if (current === slides.length - 1) goTo(0)
    playing = true
    autoplay.setAttribute('aria-pressed', 'true')
    autoplay.setAttribute('aria-label', '暂停自动播放')
    autoplay.dataset.tip = '暂停'
    autoplay.querySelector('use').setAttribute('href', '#pause')
    restartTimer()
  }

  function stopAutoplay() {
    playing = false
    clearTimeout(timer)
    autoplay.setAttribute('aria-pressed', 'false')
    autoplay.setAttribute('aria-label', '开始自动播放')
    autoplay.dataset.tip = '自动播放'
    autoplay.querySelector('use').setAttribute('href', '#play')
  }

  previous.addEventListener('click', () => goTo(current - 1))
  next.addEventListener('click', () => goTo(current + 1))
  autoplay.addEventListener('click', () => playing ? stopAutoplay() : startAutoplay())
  document.querySelectorAll('[data-goto]').forEach(button => button.addEventListener('click', () => goTo(Number(button.dataset.goto))))

  const overviewGrid = document.getElementById('overview-grid')
  slides.forEach((slide, index) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'overview-item'
    button.innerHTML = `<span>${String(index + 1).padStart(2, '0')}</span><span></span>`
    button.querySelector('span:last-child').textContent = slide.dataset.title
    button.addEventListener('click', () => { overview.close(); goTo(index) })
    overviewGrid.appendChild(button)
  })
  document.getElementById('overview-open').addEventListener('click', () => overview.showModal())
  document.getElementById('help-open').addEventListener('click', () => help.showModal())
  document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => document.getElementById(button.dataset.close).close()))

  if (!document.fullscreenEnabled) fullscreen.hidden = true
  fullscreen.addEventListener('click', async () => {
    if (document.fullscreenElement) await document.exitFullscreen()
    else await document.documentElement.requestFullscreen()
  })
  document.addEventListener('fullscreenchange', () => {
    fullscreen.setAttribute('aria-label', document.fullscreenElement ? '退出全屏' : '进入全屏')
    fullscreen.dataset.tip = document.fullscreenElement ? '退出全屏' : '全屏'
    fit()
  })

  window.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || overview.open || help.open) return
    if (event.target.closest('button,a,input,textarea,select,[contenteditable="true"]')) return
    if (['ArrowRight', 'ArrowLeft', ' ', 'Home', 'End'].includes(event.key)) event.preventDefault()
    if (event.key === 'ArrowRight' || event.key === 'PageDown') goTo(current + 1)
    if (event.key === 'ArrowLeft' || event.key === 'PageUp') goTo(current - 1)
    if (event.key === 'Home') goTo(0)
    if (event.key === 'End') goTo(slides.length - 1)
    if (event.key === ' ') playing ? stopAutoplay() : startAutoplay()
    if (event.key.toLowerCase() === 'f') fullscreen.click()
    if (event.key.toLowerCase() === 'o') overview.showModal()
    if (event.key === '?') help.showModal()
  })

  document.getElementById('viewport').addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' || event.target.closest('button,dialog')) return
    touchX = event.clientX
    touchY = event.clientY
  })
  document.getElementById('viewport').addEventListener('pointerup', event => {
    if (event.pointerType === 'mouse' || event.target.closest('button,dialog')) return
    const dx = event.clientX - touchX
    const dy = event.clientY - touchY
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.2) goTo(current + (dx < 0 ? 1 : -1))
  })

  document.querySelectorAll('[data-persona]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-persona]').forEach(item => item.setAttribute('aria-pressed', String(item === button)))
    document.querySelectorAll('[data-persona-panel]').forEach(panel => { panel.hidden = panel.dataset.personaPanel !== button.dataset.persona })
  }))

  document.querySelectorAll('[data-flow]').forEach(button => button.addEventListener('click', () => {
    const phone = document.querySelector('.flow-phone')
    document.querySelectorAll('[data-flow]').forEach(item => item.setAttribute('aria-pressed', String(item === button)))
    phone.classList.add('changing')
    setTimeout(() => {
      phone.querySelector('img').src = button.dataset.src
      phone.querySelector('img').alt = button.querySelector('.flow-label').textContent
      phone.classList.remove('changing')
    }, 160)
  }))

  document.querySelectorAll('[data-ia]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-ia]').forEach(item => item.setAttribute('aria-pressed', String(item === button)))
    document.querySelectorAll('[data-ia-column]').forEach(column => column.classList.toggle('selected', column.dataset.iaColumn === button.dataset.ia))
  }))

  document.querySelectorAll('[data-disclosure]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-disclosure]').forEach(item => item.setAttribute('aria-pressed', String(item === button)))
    document.getElementById('profile-company').textContent = button.dataset.display
  }))

  const matchAction = document.getElementById('match-action')
  if (matchAction) {
    const states = ['等待喜欢', '你已喜欢', '双方喜欢 · 可以预约看房']
    const actions = ['模拟双向喜欢', '对方也喜欢', '重新演示']
    let state = 0
    matchAction.addEventListener('click', () => {
      state = state === 2 ? 0 : state + 1
      document.getElementById('mutual-stage').dataset.state = String(state)
      document.getElementById('match-status').textContent = states[state]
      matchAction.textContent = actions[state]
    })
  }

  window.addEventListener('resize', fit)
  fit()
  slides.forEach((slide, index) => { slide.inert = index !== current })
  slides[current].classList.add('is-active')
  const initial = current
  current = -1
  goTo(initial, false)
})()
