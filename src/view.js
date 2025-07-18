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
      feedback.textContent = state.rssStatus;
      feedback.classList.remove("text-danger");
      input.classList.remove("is-invalid");
      feedback.classList.add("text-success");
      input.focus();
      break;
    case "error":
      input.value = state.form.currentUrl;
      feedback.classList.remove("text-success");
      feedback.classList.add("text-danger");
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
