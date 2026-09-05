(function(){
  'use strict';
  function addJsonLd(id, data) {
    var old = document.getElementById(id);
    if (old) old.remove();
    var node = document.createElement('script');
    node.type = 'application/ld+json';
    node.id = id;
    node.textContent = JSON.stringify(data);
    document.head.appendChild(node);
  }
  function clean(value) { return String(value || '').replace(/\s+/g, ' ').trim(); }
  function getText(selector) { var el = document.querySelector(selector); return el ? clean(el.textContent) : ''; }
  var url = window.location.href.split('#')[0];
  addJsonLd('zeta-webpage-schema', {
    '@context':'https://schema.org', '@type':'WebPage', name: clean(document.title), url:url,
    description: clean((document.querySelector('meta[name="description"]') || {}).content || ''),
    isPartOf:{'@type':'WebSite',name:'ZETA BIOTECH',url:'https://zeta-biotech.com/'}
  });
  var breadcrumb = [{ '@type':'ListItem', position:1, name:'ZETA BIOTECH', item:'https://zeta-biotech.com/' }];
  if (location.pathname.indexOf('product-details') !== -1) breadcrumb.push({ '@type':'ListItem', position:2, name:'Products', item:'https://zeta-biotech.com/#products' });
  if (location.pathname.indexOf('news-details') !== -1) breadcrumb.push({ '@type':'ListItem', position:2, name:'News', item:'https://zeta-biotech.com/#news' });
  if (breadcrumb.length > 1) addJsonLd('zeta-breadcrumb-schema', {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:breadcrumb});
  if (location.pathname.indexOf('product-details') !== -1) {
    var name = getText('#productDetail h1') || clean(new URLSearchParams(location.search).get('name')) || 'ZETA BIOTECH Product';
    var image = document.querySelector('#productDetail img');
    var imageUrl = image && image.src ? image.src : 'https://zeta-biotech.com/WhatsApp%20Image%202026-09-03%20at%2011.11.04%20PM.jpeg';
    addJsonLd('zeta-product-schema', {'@context':'https://schema.org','@type':'Product',name:name,image:[imageUrl],brand:{'@type':'Brand',name:'ZETA BIOTECH'},url:url});
  }
})();
