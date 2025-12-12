import { listItems } from "./api.js";
import { renderList } from "./list.js";
import { openForm, initForm } from "./form.js";

initForm();

document.getElementById("add-new").onclick = () => openForm();

async function init() {
  const data = await listItems();
  renderList(data.items);
}

init();
