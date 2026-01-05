document.addEventListener('DOMContentLoaded', () => {
    // Simple Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: stop observing once visible
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Select all elements to animate
    const animatedElements = document.querySelectorAll('.gallery-item');
    animatedElements.forEach(el => {
        // Prepare them for observation (they are already .fade-in-up class from HTML, 
        // but we might want to trigger the animation class via JS instead for scroll control)
        
        // Actually, CSS animation runs on load. 
        // Let's modify to run on scroll for elements below the fold.
        
        // Remove the default animation class initially if we want scroll trigger
        // el.style.animationPlayState = 'paused'; 
        
        observer.observe(el);
    });
});
