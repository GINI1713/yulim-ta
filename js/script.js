document.addEventListener('DOMContentLoaded', () => {
    // --- Reveal Animations on Scroll ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // If it's a stagger group, find children and add delays
                if (entry.target.classList.contains('stagger-group')) {
                    const children = entry.target.querySelectorAll('.scroll-fade, .scroll-scale, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-down, .scroll-zoom-in');
                    children.forEach((child, index) => {
                        child.style.transitionDelay = `${(index + 1) * 0.15}s`;
                        child.classList.add('visible');
                    });
                }
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const elementsToAnimate = document.querySelectorAll('.scroll-fade, .scroll-scale, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-down, .scroll-zoom-in, .stagger-group');
    elementsToAnimate.forEach(el => observer.observe(el));

    // --- Enhanced Scroll Effects (Parallax & Fade) ---
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;

        // 1. Hero Image Special Handling
        const heroImage = document.querySelector('.hero-image');
        if (heroImage) {
            const speed = heroImage.dataset.speed || 0.15;
            const yPos = -(scrolled * speed);

            // Calculate opacity: starts fading from scroll 0 to 600
            const fadeStart = 0;
            const fadeEnd = 700;
            let opacity = 1;
            if (scrolled > fadeStart) {
                opacity = 1 - (scrolled - fadeStart) / (fadeEnd - fadeStart);
            }

            heroImage.style.opacity = Math.max(0, opacity);
            // Apply parallax movement and a subtle scale-up for premium feel
            heroImage.style.transform = `translateY(${yPos}px) scale(${1 + scrolled * 0.0002})`;
        }

        // 2. Other Parallax Elements (excluding hero-image)
        const parallaxElements = document.querySelectorAll('.parallax-target:not(.hero-image)');
        parallaxElements.forEach(el => {
            const speed = el.dataset.speed || 0.2;
            const yPos = -(scrolled * speed);
            el.style.transform = `translateY(${yPos}px)`;
        });
    });

    // --- Navbar Scroll Logic ---
    const nav = document.querySelector('.global-nav');
    if (nav) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                nav.style.background = 'rgba(255, 255, 255, 0.95)';
                nav.style.boxShadow = '0 1px 0 rgba(0,0,0,0.05)';
            } else {
                nav.style.background = 'rgba(255, 255, 255, 0.8)';
                nav.style.boxShadow = 'none';
            }
        });
    }

    // --- Smooth Scroll ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- Blog & Admin Logic (Supabase Version) ---
    const postsContainer = document.getElementById('posts-container');
    const adminModal = document.getElementById('admin-modal');
    const adminTrigger = document.getElementById('admin-trigger');
    const closeModal = document.querySelector('.close-modal');
    const postForm = document.getElementById('post-form');
    const adminPostList = document.getElementById('admin-post-list');
    const btnExport = document.getElementById('btn-export');
    const postImage = document.getElementById('post-image');
    const imagePreview = document.getElementById('image-preview');
    let currentImageBase64 = '';

    // Fetch Posts from Supabase
    async function fetchPosts() {
        try {
            const { data, error } = await supabaseClient
                .from('posts')
                .select('*')
                .order('is_pinned', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (err) {
            console.error('Error fetching posts:', err);
            return [];
        }
    }

    window.renderPosts = async function () {
        if (!postsContainer) return;
        const allPosts = await fetchPosts();
        const posts = allPosts.slice(0, 3); // Limit to 3 posts on home page
        postsContainer.innerHTML = posts.map(post => `
            <a href="blog.html?id=${post.id}" class="blog-card scroll-fade" style="text-decoration: none; color: inherit;">
                ${post.image ? `
                <div class="blog-image-wrapper">
                    <img src="${post.image}" alt="${post.title}">
                </div>` : ''}
                <div class="card-content">
                    <span class="blog-category">${post.category}</span>
                    <h3>${post.title}</h3>
                    <p>${post.excerpt}</p>
                    <div class="blog-date">${new Date(post.created_at).toLocaleDateString()}</div>
                </div>
            </a>
        `).join('');

        // Observe new elements
        document.querySelectorAll('#posts-container .scroll-fade').forEach(el => observer.observe(el));
    };

    window.renderAdminPosts = async function () {
        if (!adminPostList) return;
        const posts = await fetchPosts();
        adminPostList.innerHTML = `
            <h3 style="margin-bottom: 1.5rem; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #eee;">게시글 관리</h3>
            ${posts.map(post => `
                <div class="admin-post-item">
                    <span style="font-weight: 500;">${post.is_pinned ? '📌 ' : ''}[${post.category}] ${post.title}</span>
                    <div class="admin-post-actions">
                        <button class="btn-small btn-edit" onclick="editPost(${post.id})">수정</button>
                        <button class="btn-small btn-delete" onclick="deletePost(${post.id})">삭제</button>
                    </div>
                </div>
            `).join('')}
        `;
    };

    // Image Compression Logic
    if (postImage) {
        postImage.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function (event) {
                const img = new Image();
                img.onload = function () {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    currentImageBase64 = canvas.toDataURL('image/jpeg', 0.7);
                    imagePreview.style.display = 'block';
                    imagePreview.querySelector('img').src = currentImageBase64;
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // Admin Password
    const ADMIN_PASSWORD = 'jinhee';

    if (adminTrigger) {
        adminTrigger.addEventListener('click', () => {
            const enteredPassword = prompt('관리자 비밀번호를 입력하세요:');
            if (enteredPassword === ADMIN_PASSWORD) {
                adminModal.style.display = 'block';
                renderAdminPosts();
            } else if (enteredPassword !== null) {
                alert('비밀번호가 틀렸습니다.');
            }
        });
    }

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            adminModal.style.display = 'none';
            postForm.reset();
            imagePreview.style.display = 'none';
            currentImageBase64 = '';
            document.getElementById('post-id').value = '';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === adminModal) {
            adminModal.style.display = 'none';
        }
    });

    if (postForm) {
        postForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('post-id').value;
            const title = document.getElementById('post-title').value;
            const category = document.getElementById('post-category').value;
            const excerpt = document.getElementById('post-excerpt').value;
            const content = document.getElementById('post-content').value;

            const is_pinned = document.getElementById('post-pin').checked;

            try {
                if (id) {
                    const { error } = await supabaseClient
                        .from('posts')
                        .update({ title, category, excerpt, content, is_pinned, image: currentImageBase64 || undefined })
                        .eq('id', id);
                    if (error) throw error;
                } else {
                    const { error } = await supabaseClient
                        .from('posts')
                        .insert([{ title, category, excerpt, content, is_pinned, image: currentImageBase64 }]);
                    if (error) throw error;
                }

                alert('저장되었습니다.');
                postForm.reset();
                imagePreview.style.display = 'none';
                currentImageBase64 = '';
                document.getElementById('post-id').value = '';
                renderPosts();
                renderAdminPosts();
            } catch (err) {
                console.error('Error saving post:', err);
                alert(`저장 중 오류가 발생했습니다: ${err.message || '알 수 없는 오류'}\n\n상세 정보: ${JSON.stringify(err)}`);
            }
        });
    }

    window.editPost = async (id) => {
        const { data: post, error } = await supabaseClient
            .from('posts')
            .select('*')
            .eq('id', id)
            .single();

        if (post && !error) {
            document.getElementById('post-id').value = post.id;
            document.getElementById('post-title').value = post.title;
            document.getElementById('post-category').value = post.category;
            document.getElementById('post-excerpt').value = post.excerpt;
            document.getElementById('post-content').value = post.content;
            document.getElementById('post-pin').checked = post.is_pinned;

            if (post.image) {
                currentImageBase64 = post.image;
                imagePreview.style.display = 'block';
                imagePreview.querySelector('img').src = post.image;
            } else {
                currentImageBase64 = '';
                imagePreview.style.display = 'none';
            }

            adminModal.querySelector('.modal-content').scrollTop = 0;
        }
    };

    window.deletePost = async (id) => {
        if (confirm('정말 삭제하시겠습니까?')) {
            const { error } = await supabaseClient
                .from('posts')
                .delete()
                .eq('id', id);

            if (!error) {
                renderPosts();
                renderAdminPosts();
            }
        }
    };

    // Initial Render
    renderPosts();
});
