document.addEventListener('DOMContentLoaded', async () => {
    const archiveContainer = document.getElementById('archive-container');

    // Fetch All Posts from Supabase
    async function fetchPosts() {
        try {
            const { data, error } = await supabaseClient
                .from('posts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (err) {
            console.error('Error fetching posts:', err);
            return [];
        }
    }

    async function renderArchive() {
        if (!archiveContainer) return;

        // Get Category from URL
        const params = new URLSearchParams(window.location.search);
        const categoryFilter = params.get('category'); // e.g., "교통사고 상식"

        if (categoryFilter) {
            // Update Page Title if category is selected
            const pageTitle = document.querySelector('.typography-headline');
            if (pageTitle) pageTitle.textContent = categoryFilter;

            // Highlight active nav link
            const navLinks = document.querySelectorAll('.nav-links a');
            navLinks.forEach(link => {
                if (link.href.includes(`category=${decodeURIComponent(categoryFilter)}`) ||
                    link.href.includes(`category=${categoryFilter}`)) {
                    link.style.color = 'var(--color-primary)';
                    link.style.fontWeight = '700';
                }
            });
        }

        const posts = await fetchPosts();

        // Filter Posts
        const filteredPosts = categoryFilter
            ? posts.filter(post => post.category === categoryFilter)
            : posts;

        if (filteredPosts.length === 0) {
            archiveContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 5rem 0; opacity: 0.5;">게시글이 없습니다.</p>';
            return;
        }

        archiveContainer.innerHTML = filteredPosts.map(post => `
            <a href="blog.html?id=${post.id}" class="blog-card" style="text-decoration: none; color: inherit;">
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
    }

    renderArchive();
});
