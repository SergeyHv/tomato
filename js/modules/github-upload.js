// === НАСТРОЙКИ ===
const GITHUB_USERNAME = "SergeyHv";
const GITHUB_REPO = "tomato";
const GITHUB_FOLDER = "images"; // сюда будут загружаться фото
const GITHUB_TOKEN = ""; // токен будет храниться отдельно


// === ФУНКЦИЯ ЗАГРУЗКИ ===
export async function uploadImageToGitHub(file) {
  const fileName = `${Date.now()}-${file.name}`;
  const filePath = `${GITHUB_FOLDER}/${fileName}`;

  const content = await fileToBase64(file);

  const url = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${filePath}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GITHUB_TOKEN}`
    },
    body: JSON.stringify({
      message: `Upload ${fileName}`,
      content: content
    })
  });

  const result = await response.json();

  if (!result.content || !result.content.download_url) {
    console.error(result);
    throw new Error("Ошибка загрузки в GitHub");
  }

  // Преобразуем download_url → RAW URL
  return result.content.download_url
    .replace("https://github.com", "https://raw.githubusercontent.com")
    .replace("/blob/", "/");
}

// === ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ===
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
