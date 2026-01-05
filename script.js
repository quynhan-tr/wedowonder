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
        observer.observe(el);
    });

    // ---------------------------------------------------------
    // Hero Scroll Animation (Center Image Expansion)
    // ---------------------------------------------------------
    const centerItem = document.querySelector('.item-center-large');

    if (centerItem) {
        // Create a placeholder to hold the grid layout space
        const placeholder = document.createElement('div');
        placeholder.className = centerItem.className;
        placeholder.classList.add('animation-placeholder');
        // Ensure placeholder has no content/background but keeps size
        placeholder.style.opacity = '0';
        placeholder.style.visibility = 'hidden';

        // Insert placeholder before centerItem
        centerItem.parentNode.insertBefore(placeholder, centerItem);

        // Set initial fixed properties for the animating item
        centerItem.style.position = 'fixed';
        centerItem.style.top = '0';
        centerItem.style.left = '0';
        centerItem.style.zIndex = '200';
        centerItem.style.willChange = 'width, height, transform, border-radius';

        // Get image for filter handling
        const centerImg = centerItem.querySelector('img');
        if (centerImg) {
            centerImg.style.width = '100%';
            centerImg.style.height = '100%';
            centerImg.style.objectFit = 'cover';
            centerImg.style.transition = 'filter 0.5s ease';
        }

        function updateScroll() {
            // Get placeholder metrics (this is where the item "should" be in the flow)
            const pRect = placeholder.getBoundingClientRect();

            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;

            // Calculate center points
            const pCenterY = pRect.top + pRect.height / 2;
            const vCenterY = viewportHeight / 2;

            // Logic:
            // 1. If pCenterY > vCenterY: content is below the fold or just entering. 
            //    Match placeholder exactly.
            // 2. If pCenterY <= vCenterY: content has reached center. 
            //    Pin to center and expand.

            const isScrollingDownPastCenter = pCenterY <= vCenterY;

            if (!isScrollingDownPastCenter) {
                // STATE: Normal Scroll (Sync with placeholder)
                centerItem.style.width = `${pRect.width}px`;
                centerItem.style.height = `${pRect.height}px`;
                centerItem.style.transform = `translate(${pRect.left}px, ${pRect.top}px)`;
                centerItem.style.borderRadius = '20px';

                if (centerImg) {
                    centerImg.style.filter = ''; // Default CSS filter
                }
            } else {
                // STATE: Expansion Animation
                // Calculate progress based on how far past center we are
                // Define a "scroll distance" over which the expansion completes.
                // e.g., 600px of scrolling after hitting center.
                const distScrolledPast = vCenterY - pCenterY;
                const expansionDistance = viewportHeight * 0.6; // finish after 60vh scroll

                let progress = distScrolledPast / expansionDistance;
                if (progress > 1) progress = 1;
                if (progress < 0) progress = 0;

                // Interpolate Dimensions
                // Start: Placeholder Dim
                const startW = pRect.width;
                const startH = pRect.height;
                // End: Viewport Dim
                const endW = viewportWidth;
                const endH = viewportHeight;

                const currentW = startW + (endW - startW) * progress;
                const currentH = startH + (endH - startH) * progress;

                // Position: Center in viewport
                // The item changes size, so we calculate top/left to keep it centered
                const destX = (viewportWidth - currentW) / 2;
                const destY = (viewportHeight - currentH) / 2;

                centerItem.style.width = `${currentW}px`;
                centerItem.style.height = `${currentH}px`;
                centerItem.style.transform = `translate(${destX}px, ${destY}px)`;

                // Border Radius: Fade to 0
                // Keep the corner rounder for a bit longer (start reducing after 85% progress)
                let radius = 20;
                if (progress > 0.85) {
                    const radiusProgress = (progress - 0.85) / 0.15; // 0 to 1
                    radius = 20 * (1 - radiusProgress);
                }
                centerItem.style.borderRadius = `${radius}px`;

                // Filters
                // Keep the filter that the image has on the hero page (do not remove it)
                // We simply rely on CSS for the filter.
                if (centerImg) {
                    centerImg.style.filter = ''; // Ensure we default to CSS
                }
            }
        }

        window.addEventListener('scroll', updateScroll);
        window.addEventListener('resize', updateScroll);
        // Initial call
        updateScroll();
    }
});
