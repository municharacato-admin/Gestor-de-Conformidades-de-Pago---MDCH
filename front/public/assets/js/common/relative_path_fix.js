document.addEventListener('DOMContentLoaded', () => {
    const cssLink = document.querySelector('link[href*="../../addons/bootstrap/bootstrap.min.css"]');
    if (!cssLink) {
        return;
    }

    const cssHref = cssLink.getAttribute('href');
    const deploymentPath = cssHref.slice(0, cssHref.indexOf('../../addons/adminLte/adminlte.min.css'));

    document.querySelectorAll('img[src^="../../img"]').forEach(img => {
        const originalSrc = img.getAttribute('src');
        if (originalSrc) {
            const relativeSrc = originalSrc.slice(1);
            img.src = deploymentPath + relativeSrc;
        }
    });
});