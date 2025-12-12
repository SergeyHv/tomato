import { listItems } from "./api.js";
import { renderList } from "./list.js";
import { openForm, initForm } from "./form.js";
import { initUpload } from "./upload.js";

initUpload((url) => {
  document.getElementById("mainphoto").value = url;
});

initForm();

document.getElementById("add-new").onclick = () => openForm();

async function init() {
  const data = await listItems();
  renderList(data.items);
}

init();
