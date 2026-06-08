const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    } else {
      entry.target.classList.remove('visible');
    }
  });
},{
  threshold: 0.1
});

const elements = document.querySelectorAll('.scroll-fade');
elements.forEach((el) => observer.observe(el));

const boton = document.getElementById('btn-copiar');

boton.addEventListener('click', () => {
  const email = "deredaya.adm@gmail.com";

  navigator.clipboard.writeText(email)
    .then(() => {
      boton.textContent = "¡Copiado!";
      setTimeout(() => boton.textContent = "Copiar Email", 2000);
    })
    .catch(err => {
      console.error('Error al copiar al portapapeles: ', err);
    });
});