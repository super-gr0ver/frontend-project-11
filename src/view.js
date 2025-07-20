const input = document.querySelector('.form-control');
const feedback = document.querySelector('.feedback');
const addUrlBtn = document.querySelector('[type="submit"]');
// const postsContainer = document.querySelector('.posts');
const card = document.querySelector('.card');

card.innerHTML = `
<div class="card-body">
  <h2 class="card-title h4">Посты</h2>
</div>
<ul class="list-group border-0 rounded-0"></ul>
`;

const ul = document.querySelector('ul');

// const cardBody = document.createElement('div');
// cardBody.classList.add('card-body');

// const cardTitle = document.createElement('h2');
// cardTitle.classList.add('card-title', 'h4');
// cardTitle.textContent = 'Посты';

// card.appendChild(cardBody);
// cardBody.appendChild(cardTitle);

// const postsList = document.createElement('ul');
// postsList.classList.add('list-group', 'border-0', 'rounded-0');
// card.appendChild(postsList);

const view = (state) => {
  // console.log(state.posts);

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
    case 'done':
      // console.log(state.posts);

      state.posts.forEach((post) => {
        // console.log(post);
        const button = document.createElement('button');
        const li = document.createElement('li');
        li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
        const a = document.createElement('a');
        a.classList.add('fw-bold');
        a.setAttribute('href', post.link);
        a.setAttribute('data-id', post.id);
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
        li.append(a);
        a.textContent = post.title;

        li.append(button);
        button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
        button.textContent = 'Просмотр';
        button.setAttribute('type', 'button');
        button.setAttribute('data-id', post.id);
        button.setAttribute('data-bs-toggle', 'modal');
        button.setAttribute('data-bs-target', '#modal');

        ul.appendChild(li);
      });

      break;

    default:
      break;
  }
};
export default view;
