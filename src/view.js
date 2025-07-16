const input = document.querySelector('.form-control');
const feedback = document.querySelector('.feedback');
const addUrlBtn = document.querySelector('[type="submit"]');

const view = (state) => {
  // console.log(state);
  if (state.processState === 'filling') {
    feedback.textContent = '';
    input.classList.remove('is-invalid');
    addUrlBtn.disabled = false;
  }

  if (state.processState === 'processed') {
    input.value = '';
    feedback.textContent = '';
    input.classList.remove('is-invalid');
    input.focus();
  }

  if (state.errors) {
    input.value = state.form.currentUrl;
    input.classList.add('is-invalid');
    feedback.textContent = state.errors;
    addUrlBtn.disabled = true;
    input.focus();
  }
};
export default view;
