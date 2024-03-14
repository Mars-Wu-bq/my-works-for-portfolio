////////////////////////////////////////
//set current year
const year = document.querySelector(".year");
const currentYear = new Date().getFullYear();
year.textContent = currentYear;

////////////////////////////////////////
//make mobile navigation work
const header = document.querySelector(".header");
const menuBtn = document.querySelector(".menu-btn");
menuBtn.addEventListener("click", function () {
  header.classList.toggle("nav-open");
});

/////////////////////////////////////////
//scroll back to top
const allLinks = document.querySelectorAll("a:link");

allLinks.forEach(function (link) {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    const href = link.getAttribute("href");
    console.log(href);

    if (href === "#")
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    //scroll to other links
    if (href !== "#" && href.startsWith("#")) {
      const section = document.querySelector(href);
      section.scrollIntoView({ behavior: "smooth" });
    }

    //close mobile navigation
    if (link.classList.contains("main-nav-link"))
      header.classList.toggle("nav-open");
  });
});

///////////////////////////////////////////////
//stichy navigation
const sectionHero = document.querySelector(".section-hero");

const observer = new IntersectionObserver(
  function (entries) {
    const ent = entries[0];

    console.log(ent);
    if (!ent.isIntersecting) document.body.classList.add("sticky");
    if (ent.isIntersecting) document.body.classList.remove("sticky");
  },
  {
    root: null,
    threshold: 0,
    rootMargin: "-80px",
  }
);
observer.observe(sectionHero);
