// =====================
// Slider functions
// =====================
function slideTo(sliderId, idx) {
    const slider = document.getElementById(sliderId);
    if (!slider) return;
    const slides = slider.querySelectorAll('.slide');
    const dots = slider.querySelectorAll('.dot');
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    if (slides[idx]) slides[idx].classList.add('active');
    if (dots[idx]) dots[idx].classList.add('active');
    if (slides[idx]) {
        const vid = slides[idx].querySelector('video');
        if (vid) vid.play();
    }
}

function slideNav(sliderId, dir) {
    const slider = document.getElementById(sliderId);
    if (!slider) return;
    const slides = slider.querySelectorAll('.slide');
    let cur = [...slides].findIndex(s => s.classList.contains('active'));
    slideTo(sliderId, (cur + dir + slides.length) % slides.length);
}

// =====================
// Toast helper
// =====================
function showToast(msg) {
    const t = document.getElementById('toastMsg');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

// =====================
// Follow button toggle
// =====================
function toggleFollow(btn) {
    if (btn.textContent === 'Mengikuti') {
        btn.textContent = 'Diikuti ✓';
        btn.style.background = 'transparent';
        btn.style.border = '1px solid rgba(255,255,255,0.3)';
        btn.style.color = '#fff';
        showToast('Mengikuti dutainisiatif.jabar 💚');
    } else {
        btn.textContent = 'Mengikuti';
        btn.style.background = '';
        btn.style.border = '';
        btn.style.color = '';
    }
}

// =====================
// Caption toggle
// =====================
function toggleCaption(el) {
    const caption = el.closest('.igp-caption');
    if (caption) caption.classList.toggle('expanded');
}

// =====================
// IG Post Interactions & DOMContentLoaded
// =====================
document.addEventListener('DOMContentLoaded', () => {

    // KODE MENU HAMBURGER SUDAH DIHAPUS DARI SINI
    // KARENA SUDAH DIURUS OLEH FILE SCRIPT.JS

    // --- FITUR IG POST ---
    const cards = document.querySelectorAll('.ig-post-card');

    cards.forEach((card, idx) => {
        const storageKey = 'dutifjabar_post_' + idx;
        let state = JSON.parse(localStorage.getItem(storageKey)) || { liked: false, saved: false, likes: 0, comments: [] };

        const likeBtn = card.querySelector('.like-btn');
        const commentBtn = card.querySelector('.comment-btn');
        const shareBtn = card.querySelector('.share-btn');
        const saveBtn = card.querySelector('.save-btn');
        const likesEl = card.querySelector('.igp-likes');
        const commSection = card.querySelector('.igp-comments');
        const commentsList = card.querySelector('.igp-comments-list');
        const commentInput = card.querySelector('.igp-comment-input');
        const commentSubmit = card.querySelector('.igp-comment-submit');

        // Render functions
        const renderLikes = () => {
            if (likesEl) likesEl.textContent = state.likes === 0 ? '0 suka' : state.likes + ' suka';
            if (likeBtn) {
                const icon = likeBtn.querySelector('i');
                if (icon) {
                    if (state.liked) {
                        icon.className = 'fas fa-heart';
                        likeBtn.style.color = '#ed4956';
                    } else {
                        icon.className = 'far fa-heart';
                        likeBtn.style.color = '#fff';
                    }
                }
            }
        };

        const renderSave = () => {
            if (saveBtn) {
                const icon = saveBtn.querySelector('i');
                if (icon) icon.className = state.saved ? 'fas fa-bookmark' : 'far fa-bookmark';
            }
        };

        const renderComments = () => {
            if (commentsList) {
                commentsList.innerHTML = state.comments.map(c =>
                    `<div class="igp-comment-item"><strong>${c.user}</strong> ${c.text}</div>`
                ).join('');
                commentsList.scrollTop = commentsList.scrollHeight;
            }
        };

        // Initial render
        renderLikes(); renderSave(); renderComments();

        const save = () => localStorage.setItem(storageKey, JSON.stringify(state));

        // Like
        if (likeBtn) {
            likeBtn.addEventListener('click', () => {
                state.liked = !state.liked;
                state.likes = state.liked ? state.likes + 1 : Math.max(0, state.likes - 1);
                renderLikes();
                save();
                if (state.liked) {
                    likeBtn.style.transform = 'scale(1.3)';
                    setTimeout(() => likeBtn.style.transform = '', 200);
                }
            });
        }

        // Comment toggle
        if (commentBtn && commSection && commentInput) {
            commentBtn.addEventListener('click', () => {
                commSection.classList.toggle('open');
                if (commSection.classList.contains('open')) commentInput.focus();
            });
        }

        // Comment input enable
        if (commentInput && commentSubmit) {
            commentInput.addEventListener('input', () => {
                commentSubmit.classList.toggle('active', commentInput.value.trim().length > 0);
            });

            // Submit comment
            const addComment = () => {
                const text = commentInput.value.trim();
                if (!text) return;
                let username = localStorage.getItem('dutif_jabar_user');
                if (!username) {
                    username = prompt('Nama kamu (kosongkan untuk Anonim):') || 'Anonim';
                    localStorage.setItem('dutif_jabar_user', username);
                }
                state.comments.push({ user: username, text });
                renderComments();
                commentInput.value = '';
                commentSubmit.classList.remove('active');
                save();
            };
            commentSubmit.addEventListener('click', addComment);
            commentInput.addEventListener('keypress', e => { if (e.key === 'Enter') addComment(); });
        }

        // Share
        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                const url = window.location.href.split('#')[0] + '#igpost-' + idx;
                if (navigator.share) {
                    navigator.share({ title: 'Duta Inisiatif Jabar', text: 'Lihat postingan ini!', url }).catch(() => { });
                } else {
                    navigator.clipboard.writeText(url).then(() => showToast('Tautan disalin! 🔗')).catch(() => showToast('Gagal menyalin tautan.'));
                }
            });
        }

        // Save
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                state.saved = !state.saved;
                renderSave();
                save();
                showToast(state.saved ? 'Disimpan ke koleksi 🔖' : 'Dihapus dari koleksi');
            });
        }
    });

    // --- ANIMASI SCROLL ---
    const observer = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('scrolled'); observer.unobserve(e.target); } });
    }, { threshold: 0.1 });
    document.querySelectorAll('.scroll-element').forEach(el => observer.observe(el));
});