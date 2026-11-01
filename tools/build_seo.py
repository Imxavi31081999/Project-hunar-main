"""Regenerate everything SEO-related that depends on the product list.

Run from the project root after editing assets/js/products.js:

    python tools/build_seo.py

It rewrites, in catalogue.html, the filter chips, the product cards (real HTML so
search engines can read them) and the JSON-LD block, and regenerates sitemap.xml
(including product image entries) and robots.txt.
"""
import os, re, json, html, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
SITE = 'https://projecthunar.in'
ORDER = ['Crochet Bags', 'Crochet', 'Bags', 'Pouches', 'Madhubani Art', 'Home & Cushions', 'Garments', 'Accessories']
BLURB = {
    'Crochet Bags': 'Hand-crocheted tote and hobo bags',
    'Crochet': 'Crochet flowers and soft toys',
    'Bags': 'Quilted laptop and tote bags',
    'Pouches': 'Quilted cosmetic pouches',
    'Madhubani Art': 'Hand-painted Madhubani (Mithila) art',
    'Home & Cushions': 'Cushions and home decor',
    'Garments': 'Handstitched garments',
    'Accessories': 'Handmade accessories',
}


def read(p):
    return open(p, encoding='utf-8', newline='').read().replace('\r\n', '\n')


def write(p, t):
    open(p, 'w', encoding='utf-8', newline='').write(t)


def slug(t):
    return re.sub(r'[^a-z0-9]+', '-', t.lower().replace('&', 'and')).strip('-')


def load_items():
    js = read('assets/js/products.js')
    items = []
    for name in ('madhubaniItems', 'handmadeItems'):
        block = re.search(r'const %s = \[(.*?)\n\];' % name, js, re.S).group(1)
        for src, label, cat in re.findall(r'src:\s*"([^"]+)",\s*label:\s*"([^"]+)",\s*cat:\s*"([^"]+)"', block):
            items.append({'src': src, 'label': json.loads('"%s"' % label), 'cat': cat})
    return items


def esc(t):
    return html.escape(t, quote=True)


def swap(text, tag, body):
    a = '<!-- %s:START -->' % tag
    b = '<!-- %s:END -->' % tag
    i = text.index(a) + len(a)
    j = text.index(b)
    return text[:i] + '\n' + body + '\n' + text[j:]


def main():
    items = load_items()
    cats = [c for c in ORDER if any(i['cat'] == c for i in items)]

    chips = ['<div class="cat-filters" id="catFilters" role="group" aria-label="Filter products by category">']
    chips.append('  <button type="button" class="cat-chip active" data-cat="All" aria-pressed="true">All<span>%d</span></button>' % len(items))
    for c in cats:
        n = sum(1 for i in items if i['cat'] == c)
        chips.append('  <button type="button" class="cat-chip" data-cat="%s" aria-pressed="false" title="%s">%s<span>%d</span></button>' % (esc(c), esc(BLURB[c]), esc(c), n))
    chips.append('</div>')

    cards = []
    for it in items:
        alt = '%s — handmade by women artisans at Project Hunar' % it['label']
        cards.append(
            '      <article class="cat-card" data-lb-open data-collection="catalogue" data-idx="0" data-cat="%s" data-src="%s">\n'
            '        <div class="cat-card-media"><img src="%s" alt="%s" loading="lazy" decoding="async" width="600" height="750"></div>\n'
            '        <div class="cat-card-body">\n'
            '          <span class="cat-card-cat">%s</span>\n'
            '          <h2 class="cat-card-title">%s</h2>\n'
            '          <span class="cat-card-meta">Made to order · Min. 25 pcs</span>\n'
            '        </div>\n'
            '      </article>' % (esc(it['cat']), esc(it['src']), esc(it['src']), esc(alt), esc(it['cat']), esc(it['label'])))

    ld = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'BreadcrumbList',
                'itemListElement': [
                    {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE + '/'},
                    {'@type': 'ListItem', 'position': 2, 'name': 'Catalogue', 'item': SITE + '/catalogue.html'},
                ],
            },
            {
                '@type': 'CollectionPage',
                '@id': SITE + '/catalogue.html#page',
                'url': SITE + '/catalogue.html',
                'name': 'Project Hunar Product Catalogue',
                'inLanguage': 'en-IN',
                'isPartOf': {'@id': SITE + '/#website'},
                'about': {'@id': SITE + '/#organization'},
                'mainEntity': {
                    '@type': 'ItemList',
                    'numberOfItems': len(items),
                    'itemListElement': [
                        {
                            '@type': 'ListItem', 'position': n + 1,
                            'item': {
                                '@type': 'Product',
                                'name': it['label'],
                                'category': it['cat'],
                                'image': SITE + '/' + it['src'],
                                'brand': {'@type': 'Brand', 'name': 'Project Hunar'},
                                'description': '%s. Handmade by women artisans at Project Hunar (Anubhav NGO). Made to order, minimum 25 pieces.' % it['label'],
                            },
                        }
                        for n, it in enumerate(items)
                    ],
                },
            },
        ],
    }
    ld_html = '<script type="application/ld+json">\n' + json.dumps(ld, indent=1, ensure_ascii=False) + '\n</script>'

    cat = read('catalogue.html')
    cat = swap(cat, 'CHIPS', '    ' + '\n    '.join(chips))
    cat = swap(cat, 'CARDS', '\n'.join(cards))
    cat = swap(cat, 'LD', ld_html)
    write('catalogue.html', cat)

    today = datetime.date.today().isoformat()
    urls = [
        (SITE + '/', '1.0', 'weekly', [i['src'] for i in items[:0]]),
        (SITE + '/catalogue.html', '0.9', 'weekly', [i['src'] for i in items]),
    ]
    sm = ['<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">']
    labels = {i['src']: i['label'] for i in items}
    for loc, prio, freq, imgs in urls:
        sm.append('  <url>')
        sm.append('    <loc>%s</loc>' % loc)
        sm.append('    <lastmod>%s</lastmod>' % today)
        sm.append('    <changefreq>%s</changefreq>' % freq)
        sm.append('    <priority>%s</priority>' % prio)
        for s in imgs:
            sm.append('    <image:image><image:loc>%s/%s</image:loc><image:title>%s</image:title></image:image>' % (SITE, html.escape(s.replace(' ', '%20')), esc(labels[s])))
        sm.append('  </url>')
    sm.append('</urlset>')
    write('sitemap.xml', '\n'.join(sm) + '\n')

    write('robots.txt', 'User-agent: *\nAllow: /\nDisallow: /archive/\nDisallow: /tools/\n\nSitemap: %s/sitemap.xml\n' % SITE)
    print('built: %d products, %d categories' % (len(items), len(cats)))


main()
