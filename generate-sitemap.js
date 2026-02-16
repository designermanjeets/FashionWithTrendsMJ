const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://fashionwithtrends.com';
const API_BASE_URL = 'https://api.fashioncarft.com/public/api';
const OUTPUT_FILE = path.join(__dirname, 'src', 'sitemap.xml');

// Static Routes with Priorities
const staticRoutes = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/about-us', changefreq: 'monthly', priority: 0.8 },
    { url: '/contact-us', changefreq: 'monthly', priority: 0.8 },
    { url: '/privacy-policy', changefreq: 'yearly', priority: 0.6 },
    { url: '/term-condition', changefreq: 'yearly', priority: 0.6 },
    { url: '/return-exchange', changefreq: 'yearly', priority: 0.6 },
    { url: '/Refund-and-Cancellation-Policy', changefreq: 'yearly', priority: 0.6 },
    { url: '/shipping-delivery', changefreq: 'yearly', priority: 0.6 },
    { url: '/faq', changefreq: 'monthly', priority: 0.6 },
    { url: '/offers', changefreq: 'weekly', priority: 0.8 },
    { url: '/order/tracking', changefreq: 'monthly', priority: 0.6 },
    { url: '/collections', changefreq: 'weekly', priority: 0.8 },

    { url: '/account', changefreq: 'monthly', priority: 0.5 },
    { url: '/auth/login', changefreq: 'monthly', priority: 0.5 },
];

// Helper to fetch data
const fetchData = (url) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
};

const generateSitemap = async () => {
    console.log('Starting Sitemap Generation...');
    let urls = [...staticRoutes];

    try {
        // Fetch Products
        console.log('Fetching Products...');
        const productData = await fetchData(`${API_BASE_URL}/product?paginate=1000`);
        if (productData && productData.data) {
            productData.data.forEach(product => {
                if (product.slug) {
                    urls.push({
                        url: `/product/${product.slug}`,
                        changefreq: 'weekly',
                        priority: 0.8
                    });
                }
            });
            console.log(`Added ${productData.data.length} products.`);
        }

        // Fetch Categories
        console.log('Fetching Categories...');
        const categoryData = await fetchData(`${API_BASE_URL}/category?paginate=1000`);
        if (categoryData && categoryData.data) {
            categoryData.data.forEach(category => {
                if (category.slug) {
                    urls.push({
                        url: `/category/${category.slug}`,
                        changefreq: 'weekly',
                        priority: 0.8
                    });
                }
            });
            console.log(`Added ${categoryData.data.length} categories.`);
        }



        // Generate XML
        console.log('Generating XML...');
        const today = new Date().toISOString().split('T')[0];

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        // Remove duplicates based on URL
        const uniqueUrls = new Map();
        urls.forEach(item => {
            const lowerUrl = item.url.toLowerCase();
            if (!uniqueUrls.has(lowerUrl)) {
                uniqueUrls.set(lowerUrl, item);
            }
        });

        uniqueUrls.forEach((item) => {
            xml += '  <url>\n';
            xml += `    <loc>${BASE_URL}${item.url}</loc>\n`;
            xml += `    <lastmod>${today}</lastmod>\n`;
            xml += `    <changefreq>${item.changefreq}</changefreq>\n`;
            xml += `    <priority>${item.priority}</priority>\n`;
            xml += '  </url>\n';
        });

        xml += '</urlset>';

        fs.writeFileSync(OUTPUT_FILE, xml);
        console.log(`Sitemap generated successfully at ${OUTPUT_FILE}`);
        console.log(`Total URLs: ${uniqueUrls.size}`);

    } catch (error) {
        console.error('Error generating sitemap:', error);
    }
};

generateSitemap();
