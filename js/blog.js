// Simple Markdown to HTML converter
function markdownToHtml(text) {
    if (!text) return '';

    let html = text;

    // Escape HTML first (prevent XSS)
    html = html.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Headers (### before ## before #)
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1 style="font-size: 1.8rem; margin: 2rem 0 1rem;">$1</h1>');

    // Bold (**text** or __text__)
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

    // Italic (*text* or _text_)
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');

    // Strikethrough (~~text~~)
    html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

    // Unordered lists (- item or * item)
    html = html.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul style="margin: 1rem 0; padding-left: 1.5rem;">$&</ul>');

    // Ordered lists (1. item)
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Horizontal rule (---)
    html = html.replace(/^---$/gm, '<hr style="margin: 2rem 0; border: none; border-top: 1px solid #eee;">');

    // Line breaks
    html = html.replace(/\n/g, '<br>');

    // Clean up extra <br> after block elements
    html = html.replace(/<\/(h1|h2|h3|ul|ol|li|hr)><br>/g, '</$1>');
    html = html.replace(/<br><(h1|h2|h3|ul|ol)/g, '<$1');

    return html;
}

document.addEventListener('DOMContentLoaded', async () => {
    const blogContent = document.getElementById('blog-content');
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id');

    async function renderPost() {
        if (!postId) {
            blogContent.innerHTML = '<h1>게시글을 찾을 수 없습니다.</h1>';
            return;
        }

        try {
            const { data: post, error } = await supabaseClient
                .from('posts')
                .select('*')
                .eq('id', postId)
                .single();

            if (error || !post) {
                blogContent.innerHTML = '<h1>게시글이 존재하지 않습니다.</h1>';
                return;
            }

            // Update Document Title
            document.title = `${post.title} | 유림 소식`;

            blogContent.innerHTML = `
                <div class="blog-header">
                    <div class="blog-meta">
                        <span class="blog-category" style="margin-bottom: 2rem; display: inline-block;">${post.category}</span><br>
                        <span>등록일: ${new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                    <h1 class="blog-title">${post.title}</h1>
                </div>
                
                ${post.image ? `
                <div class="featured-image" style="margin-bottom: 4rem; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
                    <img src="${post.image}" alt="${post.title}" style="width: 100%; display: block;">
                </div>` : ''}
                
                <div class="blog-full-content">
                    ${markdownToHtml(post.content || post.excerpt)}
                </div>

                <div style="margin-top: 4rem; display: flex; gap: 1rem;">
                    <a href="list.html" class="btn-secondary" style="text-decoration: none; padding: 0.8rem 2rem;">목록으로 돌아가기</a>
                </div>
                
                <div style="margin-top: 5rem; padding-top: 3rem; border-top: 1px solid #eee;">
                    <p style="color: #86868b; font-size: 0.95rem;">
                        유림한의원은 환자분들의 빠른 쾌유를 위해 최선을 다합니다.<br>
                        상담이 필요하시면 언제든 문의해 주세요.
                    </p>
                    <a href="tel:054-291-9975" class="btn-primary" style="margin-top: 2rem;">📞 상담 전화하기</a>
                </div>
            `;
        } catch (err) {
            console.error('Error fetching post:', err);
            blogContent.innerHTML = '<h1>데이터를 불러오는 중 오류가 발생했습니다.</h1>';
        }
    }

    renderPost();
});
