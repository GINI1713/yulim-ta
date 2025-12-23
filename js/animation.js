document.addEventListener('DOMContentLoaded', () => {
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
});
