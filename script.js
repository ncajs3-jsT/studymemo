const STORAGE_KEY = "learning-board-posts";

const postList = document.querySelector("#postList");
const emptyState = document.querySelector("#emptyState");
const searchInput = document.querySelector("#searchInput");
const postDialog = document.querySelector("#postDialog");
const postForm = document.querySelector("#postForm");
const dialogTitle = document.querySelector("#dialogTitle");
const dialogEyebrow = document.querySelector("#dialogEyebrow");
const postId = document.querySelector("#postId");
const postTitle = document.querySelector("#postTitle");
const postAuthor = document.querySelector("#postAuthor");
const postContent = document.querySelector("#postContent");
const submitButton = postForm.querySelector("button[type='submit']");

let posts = loadPosts();

function loadPosts() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);

  const samples = [
    {
      id: crypto.randomUUID(),
      title: "HTML 시맨틱 태그 정리",
      author: "김민준",
      content: "header, main, section, article의 역할을 정리했다. 화면 구조를 의미에 맞게 나누면 유지보수가 쉬워진다.",
      createdAt: "2026-10-28"
    },
    {
      id: crypto.randomUUID(),
      title: "CSS Flexbox에서 자주 틀리는 부분",
      author: "이서연",
      content: "주축과 교차축의 개념을 헷갈리지 않도록 정리했다. justify-content는 주축, align-items는 교차축을 담당한다.",
      createdAt: "2026-10-27"
    },
    {
      id: crypto.randomUUID(),
      title: "JavaScript 배열 메서드 복습",
      author: "박도윤",
      content: "map은 새로운 배열을 만들고, filter는 조건에 맞는 요소를 반환한다. forEach와의 차이도 함께 연습했다.",
      createdAt: "2026-10-26"
    }
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(samples));
  return samples;
}

function savePosts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  })[character]);
}

function renderPosts() {
  const keyword = searchInput.value.trim().toLowerCase();
  const filteredPosts = posts.filter(post =>
    `${post.title} ${post.author} ${post.content}`.toLowerCase().includes(keyword)
  );

  postList.innerHTML = filteredPosts.map((post, index) => `
    <tr>
      <td>${filteredPosts.length - index}</td>
      <td><button class="post-title-button" type="button" data-post-id="${post.id}">${escapeHtml(post.title)}</button></td>
      <td>${escapeHtml(post.author)}</td>
      <td>${post.createdAt}</td>
    </tr>
  `).join("");

  emptyState.hidden = filteredPosts.length !== 0;
}

function openWriteForm(post = null) {
  dialogEyebrow.textContent = post ? "EDIT POST" : "NEW POST";
  dialogTitle.textContent = post ? "글 수정" : "새 글 작성";
  submitButton.textContent = post ? "수정하기" : "등록하기";
  postId.value = post?.id || "";
  postTitle.value = post?.title || "";
  postAuthor.value = post?.author || "";
  postContent.value = post?.content || "";

  postTitle.closest("label").hidden = false;
  postAuthor.closest("label").hidden = false;
  postContent.closest("label").hidden = false;
  submitButton.hidden = false;
  postForm.querySelector(".dialog-actions").hidden = false;
  postDialog.showModal();
  postTitle.focus();
}

function openPostDetail(post) {
  dialogEyebrow.textContent = "STUDY NOTE";
  dialogTitle.textContent = post.title;
  postTitle.closest("label").hidden = true;
  postAuthor.closest("label").hidden = true;
  postContent.closest("label").hidden = true;

  let detail = postDialog.querySelector(".view-detail");
  if (!detail) {
    detail = document.createElement("div");
    detail.className = "view-detail";
    postForm.insertBefore(detail, postForm.querySelector(".dialog-actions"));
  }
  detail.hidden = false;
  detail.innerHTML = `
    <p class="view-meta">${escapeHtml(post.author)} · ${post.createdAt}</p>
    <p class="view-content">${escapeHtml(post.content)}</p>
  `;

  submitButton.textContent = "수정";
  submitButton.hidden = false;
  submitButton.dataset.action = "edit";
  submitButton.dataset.postId = post.id;
  postForm.querySelector(".dialog-actions").hidden = false;

  let deleteButton = postForm.querySelector(".delete-button");
  if (!deleteButton) {
    deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "secondary-button delete-button";
    deleteButton.textContent = "삭제";
    postForm.querySelector(".dialog-actions").prepend(deleteButton);
  }
  deleteButton.hidden = false;
  deleteButton.dataset.postId = post.id;
  postDialog.showModal();
}

function closeDialog() {
  const detail = postDialog.querySelector(".view-detail");
  if (detail) detail.hidden = true;
  const deleteButton = postForm.querySelector(".delete-button");
  if (deleteButton) deleteButton.hidden = true;
  submitButton.dataset.action = "";
  submitButton.dataset.postId = "";
  postDialog.close();
}

postForm.addEventListener("submit", event => {
  event.preventDefault();

  if (submitButton.dataset.action === "edit") {
    const post = posts.find(item => item.id === submitButton.dataset.postId);
    if (post) openWriteForm(post);
    return;
  }

  const id = postId.value;
  if (id) {
    posts = posts.map(post => post.id === id ? {
      ...post,
      title: postTitle.value.trim(),
      author: postAuthor.value.trim(),
      content: postContent.value.trim()
    } : post);
  } else {
    posts.unshift({
      id: crypto.randomUUID(),
      title: postTitle.value.trim(),
      author: postAuthor.value.trim(),
      content: postContent.value.trim(),
      createdAt: new Date().toISOString().slice(0, 10)
    });
  }

  savePosts();
  renderPosts();
  closeDialog();
});

postList.addEventListener("click", event => {
  const button = event.target.closest("[data-post-id]");
  if (!button) return;
  const post = posts.find(item => item.id === button.dataset.postId);
  if (post) openPostDetail(post);
});

postForm.querySelector(".dialog-actions").addEventListener("click", event => {
  if (!event.target.classList.contains("delete-button")) return;
  const post = posts.find(item => item.id === event.target.dataset.postId);
  if (!post || !confirm(`“${post.title}” 글을 삭제할까요?`)) return;
  posts = posts.filter(item => item.id !== post.id);
  savePosts();
  renderPosts();
  closeDialog();
});

document.querySelector("#openWriteButton").addEventListener("click", () => openWriteForm());
document.querySelector("#closeDialogButton").addEventListener("click", closeDialog);
document.querySelector("#cancelButton").addEventListener("click", closeDialog);
searchInput.addEventListener("input", renderPosts);

postDialog.addEventListener("click", event => {
  if (event.target === postDialog) closeDialog();
});

renderPosts();
