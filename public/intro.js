// Independent of the quiz, network, media and the optional 3D experience.
(() => {
  const layer = document.querySelector('#opening');
  if (!layer) return;
  let timer, ended = false;
  const events = new AbortController();
  function finish() {
    if (ended) return;
    ended = true;
    clearTimeout(timer);
    events.abort();
    layer.remove();
  }
  try {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches || document.hidden || ['#verwaltung', '#info'].includes(location.hash)) return finish();
    // End on the click, rather than pointerdown, to consume the entire skip gesture.
    layer.addEventListener('click', e => { e.preventDefault(); e.stopImmediatePropagation(); finish(); }, {signal: events.signal});
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); finish(); }
      else if (e.key === 'Tab') finish();
    }, {capture: true, signal: events.signal});
    document.addEventListener('visibilitychange', () => { if (document.hidden) finish(); }, {signal: events.signal});
    window.addEventListener('pagehide', finish, {signal: events.signal});
    window.addEventListener('pageshow', e => { if (e.persisted) finish(); }, {signal: events.signal});
    reduced.addEventListener('change', e => { if (e.matches) finish(); }, {signal: events.signal});
    layer.addEventListener('animationend', e => { if (e.target === layer && e.animationName === 'opening-exit') finish(); }, {signal: events.signal});
    timer = setTimeout(finish, 6000);
    layer.hidden = false;
  } catch { finish(); }
})();
