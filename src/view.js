const input = document.querySelector(".form-control");
const feedback = document.querySelector(".feedback");
const addUrlBtn = document.querySelector('[type="submit"]');

const view = (state) => {
  console.log(state);
  switch (state.processState) {
    case "filling":
      feedback.textContent = "";
      input.classList.remove("is-invalid");
      addUrlBtn.disabled = false;
      break;
    case "processed":
      input.value = "";
      feedback.textContent = "";
      input.classList.remove("is-invalid");
      input.focus();
      break;
    case "error":
      input.value = state.form.currentUrl;
      input.classList.add("is-invalid");
      feedback.textContent = state.errors;
      addUrlBtn.disabled = true;
      input.focus();
      break;

    default:
      break;
  }
};
export default view;
