// Accessible disclosure dropdowns: <button data-disclosure aria-controls="id" aria-expanded>.
// One open at a time; closes on Escape (returning focus) and on outside click.
const buttons = () => [...document.querySelectorAll<HTMLButtonElement>('[data-disclosure]')];

function setOpen(btn: HTMLButtonElement, open: boolean) {
  btn.setAttribute('aria-expanded', String(open));
  const panel = document.getElementById(btn.getAttribute('aria-controls') ?? '');
  if (panel) panel.hidden = !open;
}

function closeAll(except?: HTMLButtonElement) {
  buttons().forEach((b) => b !== except && setOpen(b, false));
}

document.addEventListener('click', (e) => {
  const btn = (e.target as Element).closest<HTMLButtonElement>('[data-disclosure]');
  if (btn) {
    const open = btn.getAttribute('aria-expanded') !== 'true';
    closeAll(btn);
    setOpen(btn, open);
    return;
  }
  if (!(e.target as Element).closest('[data-disclosure-panel]')) closeAll();
});

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  const open = buttons().find((b) => b.getAttribute('aria-expanded') === 'true');
  if (open) {
    setOpen(open, false);
    open.focus();
  }
});

// Close when focus leaves an open dropdown (keyboard users tabbing past it).
document.addEventListener('focusin', (e) => {
  const target = e.target as Element;
  buttons().forEach((b) => {
    if (b.getAttribute('aria-expanded') !== 'true') return;
    const panel = document.getElementById(b.getAttribute('aria-controls') ?? '');
    if (target !== b && !panel?.contains(target)) setOpen(b, false);
  });
});
