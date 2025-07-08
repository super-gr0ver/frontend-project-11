const input = document.querySelector('.form-control');
const feedback = document.querySelector('.feedback');

const view = (state) => {
  feedback.textContent = '';
  input.classList.remove('is-invalid');

  if (state.errors) {
    console.log(state.errors);
    input.classList.add('is-invalid');
    feedback.textContent = state.errors;
  }
};
export default view;
