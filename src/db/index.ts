export const Data = {
  Header: {
    NavItems: [
      { Name: 'INICIO', Href: '/' },
      { Name: 'SOBRE MI', Href: '/#about'},
      { Name: 'PROYECTOS', Href: '/projects' },
      { Name: 'CONTACTO', Href: '/contact' }
    ],
    link: "https://github.com/Deredaya03",
  },

  Intro: {
    Global: {  
      Title: 'Deredaya',
      Subtitle: 'Developer Frontend',
      Name: 'Brandon',
      LastName:'Calderon',
      Location: 'Xalapa. Ver',
    },
    Experience: [
      {
        Title: "Experiencia",
        Skills: ["Astro.Js", "JavaScript", "HTML", "CSS", "Tailwind CSS", "VBA", "Excel"]
      }
    ],
    Btns: {
      Tel: [{ Href: 'tel:+56444908381', Text: 'Contactame' }],
      Email: [{ Email: 'deredaya.adm@gmail.com', Text: 'Copiar Email' }]
    }
  },

  Projects: [
    {
      title: 'Finanzas',
      image: '/finanzas.png',
      link: 'https://finanzas.deredaya.com',
      dataScrollTarget: 5,
    },
    {
      title: 'Reportes',
      image: '/clientes-nuevos.png',
      link: '',
      dataScrollTarget: 20,
    },
    {
      title: 'Inventarios',
      image: '/inventarios.png',
      link: 'https://inventory-cape.vercel.app',
      dataScrollTarget: 50,
    },
    {
      title: 'Melanina',
      image: '/melanina.png',
      link: '',
      dataScrollTarget: 80,
    },
    {
      title: 'HOTEL SAKURA',
      image: '/sakura.png',
      link: 'https://sakura.deredaya.com/',
      dataScrollTarget: 80,
    },
  ],

  Footer: {
    Copyright: `© 2026 Brandon Calderon`,
    Socials: [
      { Name: 'GitHub', Href: 'https://github.com/tu-usuario' },
      { Name: 'LinkedIn', Href: 'https://linkedin.com/in/tu-usuario' }
    ]
  }
}