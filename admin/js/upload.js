export function initUpload(onUploaded) {
  const modal = document.getElementById("upload-modal");
  const openBtn = document.getElementById("upload-photo-btn");
  const closeBtn = document.getElementById("upload-close");
  const startBtn = document.getElementById("upload-start");
  const fileInput = document.getElementById("upload-file");
  const result = document.getElementById("upload-result");
  const urlInput = document.getElementById("upload-url");
  const copyBtn = document.getElementById("upload-copy");

  openBtn.onclick = () => {
    modal.classList.remove("hidden");
    result.classList.add("hidden");
    fileInput.value = "";
  };

  closeBtn.onclick = () => {
    modal.classList.add("hidden");
  };

  startBtn.onclick = async () => {
    const file = fileInput.files[0];
    if (!file) return alert("Выберите файл");

    const fileName = Date.now() + "-" + file.name;
    const githubPath = `images/${fileName}`;

    const content = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(content)));

    const res = await fetch(
      "https://api.github.com/repos/SergeyHv/tomato/contents/" + githubPath,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer YOUR_GITHUB_TOKEN"
        },
        body: JSON.stringify({
          message: "Upload image",
          content: base64
        })
      }
    );

    const data = await res.json();

    const rawUrl = `https://raw.githubusercontent.com/SergeyHv/tomato/main/${githubPath}`;

    urlInput.value = rawUrl;
    result.classList.remove("hidden");

    onUploaded(rawUrl);
  };

  copyBtn.onclick = () => {
    navigator.clipboard.writeText(urlInput.value);
    alert("Ссылка скопирована");
  };
}
