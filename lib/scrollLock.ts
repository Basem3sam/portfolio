let locked = false;

export function lockScroll() {
  if (locked) return;
  locked = true;
  document.body.style.overflow = "hidden";
  document.body.style.position = "fixed";
  document.body.style.width = "100%";
  document.body.style.top = `-${window.scrollY}px`;
}

export function unlockScroll() {
  if (!locked) return;
  locked = false;
  const top = document.body.style.top;
  document.body.style.overflow = "";
  document.body.style.position = "";
  document.body.style.width = "";
  document.body.style.top = "";
  window.scrollTo(0, parseInt(top || "0") * -1);
}
