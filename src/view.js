const input = document.querySelector('.form-control');
const feedback = document.querySelector('.feedback');
const addUrlBtn = document.querySelector('[type="submit"]');
const postsContainer = document.querySelector('.posts');
const card = document.querySelector('.card');

const cardBody = document.createElement('div');
cardBody.classList.add('card-body');

const cardTitle = document.createElement('h2');
cardTitle.classList.add('card-title', 'h4');
cardTitle.textContent = 'Посты';

card.appendChild(cardBody);
cardBody.appendChild(cardTitle);

const postsList = document.createElement('ul');
postsList.classList.add('list-group', 'border-0', 'rounded-0');
card.appendChild(postsList);

const view = (state) => {
  console.log(state);
  switch (state.processState) {
    case 'filling':
      feedback.textContent = '';
      input.classList.remove('is-invalid');
      addUrlBtn.disabled = false;
      break;
    case 'processed':
      input.value = '';
      feedback.textContent = state.rssStatus;
      feedback.classList.remove('text-danger');
      input.classList.remove('is-invalid');
      feedback.classList.add('text-success');
      input.focus();
      break;
    case 'error':
      input.value = state.form.currentUrl;
      feedback.textContent = state.errors;
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
      input.classList.add('is-invalid');
      addUrlBtn.disabled = true;
      input.focus();
      break;

    default:
      break;
  }
};
export default view;
