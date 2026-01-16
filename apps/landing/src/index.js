// ===================================
// MYMARK LANDING PAGE INTERACTIONS
// ===================================

document.addEventListener("DOMContentLoaded", () => {
	// Intersection Observer for scroll-triggered animations
	const observerOptions = {
		root: null,
		rootMargin: "0px",
		threshold: 0.1,
	};

	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.add("is-visible");
				observer.unobserve(entry.target);
			}
		});
	}, observerOptions);

	// Add visible class styles
	const style = document.createElement("style");
	style.textContent = `
    .is-visible {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
  `;
	document.head.appendChild(style);

	// Observe feature cards for staggered animation
	const featureCards = document.querySelectorAll(".feature-card");
	featureCards.forEach((card, index) => {
		card.style.opacity = "0";
		card.style.transform = "translateY(30px)";
		card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
		observer.observe(card);
	});

	// Observe "how it works" steps
	const steps = document.querySelectorAll("#how .group");
	steps.forEach((step, index) => {
		step.style.opacity = "0";
		step.style.transform = "translateY(40px)";
		step.style.transition = `opacity 0.8s ease ${index * 0.2}s, transform 0.8s ease ${index * 0.2}s`;
		observer.observe(step);
	});

	// Smooth scroll for anchor links
	document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
		anchor.addEventListener("click", function (e) {
			const href = this.getAttribute("href");
			if (href === "#") return;

			e.preventDefault();
			const target = document.querySelector(href);
			if (target) {
				target.scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
			}
		});
	});

	// Hide scroll indicator after scrolling
	const scrollIndicator = document.querySelector(".animate-bounce-slow");
	if (scrollIndicator) {
		let hidden = false;
		window.addEventListener("scroll", () => {
			if (!hidden && window.scrollY > 100) {
				scrollIndicator.style.opacity = "0";
				scrollIndicator.style.transition = "opacity 0.5s ease";
				hidden = true;
			}
		});
	}

	// Parallax effect for background blurs
	const blurs = document.querySelectorAll(
		".animate-float, .animate-float-delayed",
	);
	window.addEventListener("scroll", () => {
		const scrolled = window.scrollY;
		blurs.forEach((blur, index) => {
			const speed = index % 2 === 0 ? 0.05 : 0.03;
			blur.style.transform = `translateY(${scrolled * speed}px)`;
		});
	});
});
