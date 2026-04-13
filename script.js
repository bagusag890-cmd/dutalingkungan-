document.addEventListener('DOMContentLoaded', () => {
    // 1. Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('scrolled');
                // Unobserve so it only happens once
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements
    const scrollElements = document.querySelectorAll('.scroll-element');
    scrollElements.forEach(el => observer.observe(el));
    
    // Trigger initial hero animations
    setTimeout(() => {
        const fadeIns = document.querySelectorAll('.fade-in');
        fadeIns.forEach(el => {
            el.classList.add('scrolled');
        });
    }, 100);

    // 2. Navbar effects on scroll
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.05)';
        } else {
            navbar.style.boxShadow = 'none';
        }
    });

    // 3. Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        // Toggle icon
        const icon = hamburger.querySelector('i');
        if(navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Close menu when clicking a link on mobile
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = hamburger.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });
});

// Global carousel state
const carouselIndices = {
    humas: 0,
    event: 0,
    sdm: 0
};

window.moveSlide = function(carouselId, direction) {
    if (carouselIndices[carouselId] === undefined) carouselIndices[carouselId] = 0;
    const track = document.getElementById(`track-${carouselId}`);
    const dots = document.querySelectorAll(`#dots-${carouselId} .dot`);
    if (!track) return;
    
    const slides = track.children;
    const totalSlides = slides.length;
    
    carouselIndices[carouselId] += direction;
    
    if (carouselIndices[carouselId] >= totalSlides) {
        carouselIndices[carouselId] = 0;
    } else if (carouselIndices[carouselId] < 0) {
        carouselIndices[carouselId] = totalSlides - 1;
    }
    
    // Move track
    track.style.transform = `translateX(-${carouselIndices[carouselId] * 100}%)`;
    
    // Update dots
    dots.forEach(dot => dot.classList.remove('active'));
    if (dots[carouselIndices[carouselId]]) {
        dots[carouselIndices[carouselId]].classList.add('active');
    }
};

// Interactive Post Features (Like, Comment, Share)
document.addEventListener('DOMContentLoaded', () => {
    const posts = document.querySelectorAll('.ig-post');
    
    // Add Toast Notification Element
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    document.body.appendChild(toast);
    
    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
    
    posts.forEach((post, index) => {
        const postId = `post-${index}`;
        post.id = postId; // Assign ID
        
        // Find Action Buttons
        const actionLeft = post.querySelector('.ig-action-left');
        const actionRight = post.querySelector('.ig-action-right'); // Bookmark
        if (!actionLeft) return;
        
        const icons = actionLeft.querySelectorAll('i');
        const btnLike = icons[0];
        const btnComment = icons[1];
        const btnShare = icons[2];
        
        // Find or create Likes element
        let likesEl = post.querySelector('.ig-post-likes');
        let initialLikes = 0;
        let likeCountSpan = null;
        if (!likesEl) {
            likesEl = document.createElement('div');
            likesEl.className = 'ig-post-likes';
            likesEl.innerHTML = `Disukai oleh <b>pemuda.jabar</b> dan <b class="like-count">0</b> lainnya`;
            const actionContainer = post.querySelector('.ig-post-actions');
            actionContainer.after(likesEl);
            initialLikes = 0;
            likeCountSpan = likesEl.querySelector('.like-count');
        } else {
            // Reformat existing likes to include span for count
            const textMatch = likesEl.innerHTML.match(/dan\s+<b[^>]*>([\d,\.]+)\s*lainnya<\/b>/i);
            if (textMatch) {
                initialLikes = parseInt(textMatch[1].replace(/,/g, '')) || 0;
                likesEl.innerHTML = likesEl.innerHTML.replace(textMatch[1] + ' lainnya', `<span class="like-count">${initialLikes.toLocaleString('id-ID')}</span> lainnya`);
                likeCountSpan = likesEl.querySelector('.like-count');
            } else {
                initialLikes = 0;
                likesEl.innerHTML += ` <span class="like-count-wrapper" style="display:none"><b class="like-count">0</b> lainnya</span>`;
                likeCountSpan = likesEl.querySelector('.like-count');
            }
        }
        
        // Ensure Bookmark exists (fallback if needed)
        const btnSave = actionRight || post.querySelector('.fa-bookmark');
        
        // State
        const STORAGE_KEY = `dutif_jabar14_${postId}`;
        let postState = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
            liked: false,
            saved: false,
            likesCount: initialLikes,
            comments: []
        };
        
        // Helper to update Like UI
        const updateLikeUI = () => {
            if (postState.liked) {
                btnLike.classList.remove('far');
                btnLike.classList.add('fas', 'liked');
            } else {
                btnLike.classList.remove('fas', 'liked');
                btnLike.classList.add('far');
            }
            if (likeCountSpan) {
                likeCountSpan.textContent = postState.likesCount.toLocaleString('id-ID');
                const wrapper = likesEl.querySelector('.like-count-wrapper');
                if (wrapper) wrapper.style.display = postState.likesCount > 0 ? 'inline' : 'none';
            }
        };

        // Helper to update Save UI
        const updateSaveUI = () => {
            if (!btnSave) return;
            if (postState.saved) {
                btnSave.classList.remove('far');
                btnSave.classList.add('fas');
            } else {
                btnSave.classList.remove('fas');
                btnSave.classList.add('far');
            }
        };
        
        // Initial UI State
        updateLikeUI();
        updateSaveUI();
        
        // Save State Helper
        const saveState = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(postState));
        
        // Like Interaction
        if (btnLike) {
            btnLike.addEventListener('click', () => {
                postState.liked = !postState.liked;
                if (postState.liked) {
                    postState.likesCount++;
                } else {
                    postState.likesCount = Math.max(0, postState.likesCount - 1);
                }
                updateLikeUI();
                saveState();
            });
        }
        
        // Save (Bookmark) Interaction
        if (btnSave) {
            btnSave.addEventListener('click', () => {
                postState.saved = !postState.saved;
                updateSaveUI();
                saveState();
                showToast(postState.saved ? 'Disimpan ke koleksi' : 'Dihapus dari koleksi');
            });
        }
        
        // Share Interaction
        if (btnShare) {
            btnShare.addEventListener('click', () => {
                const url = window.location.href.split('#')[0] + '#' + postId;
                if (navigator.share) {
                    navigator.share({
                        title: 'Duta Inisiatif Jabar',
                        text: 'Cek profil ini di Duta Inisiatif Jabar!',
                        url: url
                    }).catch(console.error);
                } else {
                    navigator.clipboard.writeText(url).then(() => {
                        showToast('Tautan postingan disalin!');
                    }).catch(() => {
                        showToast('Gagal menyalin tautan.');
                    });
                }
            });
        }
        
        // Initialize Comment Section HTML
        // Only append after caption to mirror IG
        let captionEl = post.querySelector('.ig-post-caption');
        if (!captionEl) {
            captionEl = document.createElement('div');
            captionEl.className = 'ig-post-caption';
            post.appendChild(captionEl);
        }

        const commentSection = document.createElement('div');
        commentSection.className = 'ig-comment-section';
        commentSection.innerHTML = `
            <div class="ig-comments-list"></div>
            <div class="ig-comment-input-wrapper">
                <input type="text" class="ig-comment-input" placeholder="Tambahkan komentar (sebagai Publik)...">
                <button class="ig-comment-post-btn">Kirim</button>
            </div>
        `;
        captionEl.after(commentSection);
        
        const commentList = commentSection.querySelector('.ig-comments-list');
        const input = commentSection.querySelector('.ig-comment-input');
        const postBtn = commentSection.querySelector('.ig-comment-post-btn');
        
        const renderComments = () => {
            commentList.innerHTML = postState.comments.map(c => 
                `<div class="ig-comment-item"><strong>${c.user}</strong> ${c.text}</div>`
            ).join('');
            commentList.scrollTop = commentList.scrollHeight;
        };
        renderComments(); // Render from storage
        
        // Comment Input Interaction
        if (btnComment) {
            btnComment.addEventListener('click', () => {
                commentSection.classList.toggle('active');
                if (commentSection.classList.contains('active')) {
                    input.focus();
                }
            });
        }
        
        input.addEventListener('input', () => {
            if (input.value.trim().length > 0) {
                postBtn.classList.add('can-post');
            } else {
                postBtn.classList.remove('can-post');
            }
        });
        
        const addComment = () => {
            const text = input.value.trim();
            if (text.length > 0) {
                // Determine user (simulating google account without login)
                // Retrieve a previously saved anonymous username, or prompt for one
                let username = localStorage.getItem('dutif_jabar_user');
                if (!username) {
                    username = prompt("Masukkan nama Anda (atau tekan batal untuk Anonim):");
                    username = username ? username.trim() : "Pengguna IG";
                    localStorage.setItem('dutif_jabar_user', username);
                }

                postState.comments.push({ user: username, text: text });
                saveState();
                renderComments();
                input.value = '';
                postBtn.classList.remove('can-post');
            }
        };
        
        postBtn.addEventListener('click', addComment);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addComment();
        });
    });
});
