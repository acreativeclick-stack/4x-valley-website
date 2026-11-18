(() => {
 const footer=[...document.querySelectorAll('.footer-socials a')].map(a=>({name:a.textContent.trim(),href:a.getAttribute('href')}));
 const socialPage=!!document.querySelector('.social-link-card');
 const sections=[...document.querySelectorAll('.social-link-card')].map(card=>({id:card.id,name:card.querySelector('h2')?.textContent.trim()}));
 const failures=[];
 if(footer.map(a=>a.name).join('|')!=='Facebook|Instagram')failures.push('Footer must show only Facebook and Instagram');
 if(footer.map(a=>a.href).join('|')!=='social-links.html#facebook|social-links.html#instagram')failures.push('Footer social anchors differ');
 if(socialPage&&sections.map(c=>c.id+':'+c.name).join('|')!=='facebook:Facebook|instagram:Instagram')failures.push('Social page must show only Facebook and Instagram');
 return {footer,sections,socialPage,failures};
})()
