document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis({
        duration: 1.5,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
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
    // Exclude bottom polaroids from the standard observer so we can trigger them earlier
    const standardElements = document.querySelectorAll('.gallery-item, .polaroid-item:not(.item-4):not(.item-5):not(.item-6), .polaroid-text-content');
    standardElements.forEach(el => {
        observer.observe(el);
    });

    // Dedicated Observer for bottom polaroids to start animation earlier
    const earlierObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // earlierObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0, // Trigger immediately
        rootMargin: "0px 0px 50px 0px" // Trigger when 50px BELOW the viewport (starts earlier)
    });

    const bottomPolaroids = document.querySelectorAll('.item-4, .item-5, .item-6');
    bottomPolaroids.forEach(el => {
        earlierObserver.observe(el);
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

        // Select adjacent items to push away
        const leftItems = document.querySelectorAll('.item-tall-left, .item-stack-left-top, .item-stack-left-bottom');
        const rightItems = document.querySelectorAll('.item-stack-right-top, .item-stack-right-bottom, .item-tall-right');

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
            centerImg.style.objectFit = 'cover';
            centerImg.style.transition = 'none'; // Remove transition to sync with scroll
        }

        const textOverlay = centerItem.querySelector('.hero-overlay-text');

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

                // Reset adjacent items
                leftItems.forEach(item => item.style.transform = '');
                rightItems.forEach(item => item.style.transform = '');

                if (textOverlay) {
                    textOverlay.style.opacity = '0';
                    textOverlay.style.transform = 'translate(-50%, calc(-50% + 20vh)) rotate(5deg)'; // Start tilted and lower
                }
            } else {
                // STATE: Expansion Animation
                // Calculate progress based on how far past center we are
                // Define a "scroll distance" over which the expansion completes.
                // e.g., 600px of scrolling after hitting center.
                const distScrolledPast = vCenterY - pCenterY;
                const expansionDistance = viewportHeight * 0.6; // finish after 60vh scroll

                let progress = distScrolledPast / expansionDistance;
                // We don't clamp progress > 1 immediately, we need it for extra scroll
                let clampedProgress = Math.min(1, Math.max(0, progress));

                // Interpolate Dimensions using clampedProgress
                // Start: Placeholder Dim
                const startW = pRect.width;
                const startH = pRect.height;
                // End: Viewport Dim
                const endW = viewportWidth;
                const endH = viewportHeight;

                const currentW = startW + (endW - startW) * clampedProgress;
                const currentH = startH + (endH - startH) * clampedProgress;

                // Position: Center in viewport
                // The item changes size, so we calculate top/left to keep it centered
                let destX = (viewportWidth - currentW) / 2;
                let destY = (viewportHeight - currentH) / 2;

                // If animation is done (progress > 1), move it up
                if (progress > 1) {
                    const extraScroll = distScrolledPast - expansionDistance;
                    destY -= extraScroll;
                }

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
                // Darken image as we scroll to make text readable
                if (centerImg) {
                    // Base filter: sepia(10%) contrast(90%) grayscale(20%)
                    // Add brightness reduction. Start 1.0 -> End 0.8
                    const brightness = 1 - (0.2 * progress);
                    centerImg.style.filter = `sepia(10%) contrast(90%) grayscale(20%) brightness(${brightness})`;
                }

                // Push adjacent items
                // To keep constant distance, push by the amount the center image has expanded (half of width increase)
                const pushDistance = (viewportWidth - startW) * 0.5 * progress;

                leftItems.forEach(item => {
                    item.style.transform = `translate(-${pushDistance}px, ${distScrolledPast}px)`;
                });
                rightItems.forEach(item => {
                    item.style.transform = `translate(${pushDistance}px, ${distScrolledPast}px)`;
                });

                if (textOverlay) {
                    // Text Animation
                    // Fade in and slide up
                    // Start showing later (60%) and take shorter to complete (matches velocity roughly)
                    // Range: 0.6 -> 1.0 (duration 0.4)
                    let textProgress = (progress - 0.6) / 0.4;
                    if (textProgress < 0) textProgress = 0;
                    if (textProgress > 1) textProgress = 1;

                    textOverlay.style.opacity = textProgress;

                    // Move from lower position (20vh down) to center (0vh offset)
                    // Start: offset 20vh, End: offset 0vh
                    const yOffsetVh = 20 * (1 - textProgress);

                    // Tilt effect: Start rotated 5deg -> End 0deg (straight)
                    const currentRotation = 5 * (1 - textProgress);

                    textOverlay.style.transform = `translate(-50%, calc(-50% + ${yOffsetVh}vh)) rotate(${currentRotation}deg)`;
                }
            }
        }

        window.addEventListener('resize', updateScroll);
        // Initial call
        updateScroll();

        // Sync with Lenis loop
        lenis.on('scroll', updateScroll);
    }
});
