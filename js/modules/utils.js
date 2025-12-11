export function loadOptions(selectId, values) {
  const select = document.getElementById(selectId);
  values.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = v;
    select.appendChild(opt);
  });
}
