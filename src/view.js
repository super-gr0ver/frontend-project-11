const input = document.querySelector(".form-control");
const feedback = document.querySelector(".feedback");
const addUrlBtn = document.querySelector('[type="submit"]');
const postsContainer = document.querySelector(".posts");
const feedContainer = document.querySelector(".feeds");

postsContainer.innerHTML = `
<div class="card border-0">
  <div class="card-body">
    <h2 class="card-title h4"></h2>
  </div>
  <ul class="list-group border-0 rounded-0"></ul>
</div>
`;
const postsUl = postsContainer.querySelector("ul");

feedContainer.innerHTML = `
<div class="card border-0">
  <div class="card-body">
    <h2 class="card-title h4"></h2>
  </div>
  <ul class="list-group border-0 rounded-0"></ul>
</div>
`;
const feedUl = feedContainer.querySelector("ul");
const postUl = postsContainer.querySelector(".list-group");

const feedsHeader = feedContainer.querySelector("h2");
const postsHeader = postsContainer.querySelector("h2");

// const feedsTitle = feedContainer.querySelector('h3');
// const feedsDesc = feedContainer.querySelector('p');

const view = (state) => {
  // console.log(state.processState);
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
      console.log(state.rssStatus);
      input.value = state.form.currentUrl;
      // feedback.textContent = state.rssStatus;
      feedback.textContent = state.errors;

      feedback.classList.remove("text-success");
      feedback.classList.add("text-danger");
      input.classList.add("is-invalid");
      addUrlBtn.disabled = true;
      input.focus();
      break;
    case "done":
      feedsHeader.textContent = "Фиды";
      postsHeader.textContent = "Посты";

      feedUl.innerHTML = "";
      postUl.innerHTML = "";

      state.feeds.forEach((feed) => {
        const feedLi = document.createElement("li");
        feedLi.classList.add("list-group-item", "border-0", "border-end-0");

        const h3 = document.createElement("h3");
        h3.classList.add("h6", "m-0");
        feedLi.append(h3);
        h3.textContent = feed.feedTitle;

        const p = document.createElement("p");
        p.classList.add("m-0", "small", "text-black-50");
        feedLi.append(p);
        p.textContent = feed.feedDesc;

        feedUl.appendChild(feedLi);
        // console.log(feed.feedTitle);
      });

      state.posts.forEach((post) => {
        const button = document.createElement("button");
        const postsLi = document.createElement("li");
        postsLi.classList.add(
          "list-group-item",
          "d-flex",
          "justify-content-between",
          "align-items-start",
          "border-0",
          "border-end-0"
        );
        const a = document.createElement("a");

        const viewed = state.uiState.viewedPost[post.id - 1].viewed
          ? "fw-bold"
          : "fw-normal";
        // console.log(viewed, state.uiState.viewedPost[post.id - 1].viewed);
        // console.log(viewed);

        a.classList.add(viewed);
        a.setAttribute("href", post.link);
        a.setAttribute("data-id", post.id);
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener noreferrer");
        postsLi.append(a);
        a.textContent = post.title;

        postsLi.append(button);
        button.classList.add("btn", "btn-outline-primary", "btn-sm");
        button.textContent = "Просмотр";
        button.setAttribute("type", "button");
        button.setAttribute("data-id", post.id);
        button.setAttribute("data-bs-toggle", "modal");
        button.setAttribute("data-bs-target", "#modal");
        button.addEventListener("click", () => {
          const isViewed = state.uiState.viewedPost[post.id - 1].viewed;

          if (isViewed) {
            viewedPost(post.id - 1);
          }

          const modalTitle = document.querySelector(".modal-header");
          const modalBody = document.querySelector(".modal-body");
          modalTitle.textContent = post.title;
          modalBody.textContent = post.desc;
        });

        postsUl.appendChild(postsLi);
      });

      break;

    default:
      break;
  }
  const viewedPost = (currentPostId) => {
    // const isUniqPost = !state.uiState.viewedPost.find(({ id }) => id === currentPostId);
    // console.log(isUniqPost);
    state.uiState.viewedPost[currentPostId].viewed =
      !state.uiState.viewedPost[currentPostId].viewed;
    // console.log(state);
    view(state);
  };
};
// const button = document.querySelector('[data-bs-target="#modal"]');
// console.log(button);
export default view;
