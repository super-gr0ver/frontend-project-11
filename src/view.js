const input = document.querySelector('.form-control');
const feedback = document.querySelector('.feedback');

const view = (state) => {
  input.value = '';
  feedback.textContent = '';
  input.classList.remove('is-invalid');

  if (state.errors) {
    input.value = state.form.currentUrl;
    input.classList.add('is-invalid');
    feedback.textContent = state.errors;
  }
};
export default view;
