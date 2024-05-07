const puppeteer = require('puppeteer');

const EMAIL_SELECTOR = '#session_key';
const PASSWORD_SELECTOR = '#session_password';
const SUBMIT_SELECTOR = '.sign-in-form__submit-btn--full-width';
const LINKEDIN_LOGIN_URL = 'https://www.linkedin.com/';

const SEARCH_QUERY = 'education'; // Change this to your search query

const SEARCH_RESULT_SELECTOR = '.search-result__info';
const ABOUT_LINK_SELECTOR = '.link-without-visited-state.inline-block.ember-view';

const scrapeCompanyDetails = async (page, url) => {
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Example of scraping company details
    const companyDetails = await page.evaluate(() => {
        const companyName = document.querySelector('.app-aware-link').innerText;
        const foundedDate = document.querySelector('selector_for_founded_date').innerText; // Replace with actual selector
        const companySize = document.querySelector('selector_for_company_size').innerText; // Replace with actual selector

        return { companyName, foundedDate, companySize };
    });

    return companyDetails;
};

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        page.setViewport({ width: 1366, height: 768 });

        await page.goto(LINKEDIN_LOGIN_URL, { waitUntil: 'domcontentloaded' });
        await page.click(EMAIL_SELECTOR);
        await page.keyboard.type('aman.tke1902008@tmu.ac.in'); // Replace with your email
        await page.click(PASSWORD_SELECTOR);
        await page.keyboard.type('5522@AManchauhan2'); // Replace with your password
        await page.keyboard.press('Enter');

        await page.waitForNavigation();

        await page.goto(`https://www.linkedin.com/search/results/companies/?keywords=${SEARCH_QUERY}`, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector(SEARCH_RESULT_SELECTOR);

        const companyLinks = await page.$$eval(SEARCH_RESULT_SELECTOR, (results) => {
            return results.map(result => {
                const linkElement = result.querySelector(ABOUT_LINK_SELECTOR);
                return linkElement ? linkElement.getAttribute('href') : null;
            });
        });

        // Scrape details for each company
        for (const link of companyLinks) {
            if (link) {
                const url = `https://www.linkedin.com${link}`;
                try {
                    const companyDetails = await scrapeCompanyDetails(page, url);
                    console.log(companyDetails);
                } catch (error) {
                    console.error(`Failed to scrape details for ${url}:`, error);
                }
            }
        }

        await browser.close();
    } catch (err) {
        console.error("Caught with an error:", err);
    }
})();