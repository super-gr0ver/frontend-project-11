const input = document.querySelector('.form-control');
const feedback = document.querySelector('.feedback');
const addUrlBtn = document.querySelector('[type="submit"]');

const view = (state) => {
  // Не правильно работает
  if (state.processState === 'filling') {
    input.value = '';
    feedback.textContent = '';
    input.classList.remove('is-invalid');
    input.focus();
    addUrlBtn.disabled = false;
  }

  if (state.errors) {
    input.value = state.form.currentUrl;
    input.classList.add('is-invalid');
    feedback.textContent = state.errors;
    addUrlBtn.disabled = true;
  }

  // input.addEventListener('input', (e) => {
  //   if (e.target.value === '') {
  //     addUrlBtn.disabled = false;
  //   }
  // });
};
export default view;
