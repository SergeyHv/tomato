export function bindImageUpload(imageUpload, imagePreview, state) {
  imageUpload.addEventListener('change', () => {
    const file = imageUpload.files[0];
    if (!file) return;

    state.imageName = file.name;
    const reader = new FileReader();
    reader.onload = e => {
      state.imageBase64 = e.target.result;
      imagePreview.src = e.target.result;
      imagePreview.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  });
}

export const bust = url => url ? `${url}?t=${Date.now()}` : '';

