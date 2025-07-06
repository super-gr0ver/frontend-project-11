const input = document.querySelector('.form-control');
const feedback = document.querySelector('.feedback');

const view = (state) => {
  feedback.textContent = '';
  if (state.errors) {
    input.classList.add('is-invalid');
    feedback.textContent = 'Ссылка должна быть валидным URL';
  }
};
export default view;
