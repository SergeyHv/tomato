const API_URL = "https://tomato-admin-api-2.vercel.app/api/upload";

document.getElementById("uploadBtn").addEventListener("click", async () => {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];

  if (!file) {
    alert("Выберите файл");
    return;
  }

  const base64 = await fileToBase64(file);

  const body = {
    filename: file.name,
    contentBase64: base64.split(",")[1]
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  if (data.url) {
    document.getElementById("result").classList.remove("hidden");
    document.getElementById("imageUrl").value = data.url;
  } else {
    alert("Ошибка загрузки");
    console.log(data);
  }
});

document.getElementById("copyBtn").addEventListener("click", () => {
  const input = document.getElementById("imageUrl");
  input.select();
  document.execCommand("copy");
  alert("Ссылка скопирована");
});

function fileToBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}
