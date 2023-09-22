const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
const port = 3000;
const corsOptions = {
    origin: 'http://192.168.110.242:8860',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
app.use(bodyParser.text({ type: 'text/html' }));

const puppeteerLaunchConfig = {
    headless: true,
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--font-render-hinting=none'
    ],
};

async function convertHTMLToPDF({html}) {
    const browser = await puppeteer.launch(puppeteerLaunchConfig);
    const page = await browser.newPage();
    await page.setContent(html);

    const pdf = await page.pdf({
        format: 'A4',
        printBackground: true
    });

    await browser.close();
    return pdf;
}

async function convertHTMLToPNG(html) {
    const browser = await puppeteer.launch(puppeteerLaunchConfig);
    const page = await browser.newPage();
    await page.setContent(html);

    const screenshot = await page.screenshot();

    await browser.close();
    return screenshot;
}

async function captureURLToPDF(url) {
    const browser = await puppeteer.launch(puppeteerLaunchConfig);
    const page = await browser.newPage();

    // Navigate to the URL and wait until network is almost idle
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Wait for an additional 3 seconds after loading the page
    await page.waitForTimeout(3000);

    const pdf = await page.pdf({
        format: 'A4',
        printBackground: true
    });

    await browser.close();
    return pdf;
}

async function captureURLToPNG(url) {
    const browser = await puppeteer.launch(puppeteerLaunchConfig);
    const page = await browser.newPage();

    // Navigate to the URL and wait until network is almost idle
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Wait for an additional 3 seconds after loading the page
    await page.waitForTimeout(3000);

    const screenshot = await page.screenshot();

    await browser.close();
    return screenshot;
}

const nApiRouter = express.Router();

nApiRouter.post('/convert/pdf', bodyParser.json(), async (req, res) => {
    try {
        const pdf = await convertHTMLToPDF(req.body);
        res.set('Content-Type', 'application/pdf');
        res.send(pdf);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send('Failed to convert HTML to PDF');
    }
});

nApiRouter.post('/convert/png', async (req, res) => {
    try {
        const png = await convertHTMLToPNG(req.body);
        res.set('Content-Type', 'image/png');
        res.send(png);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send('Failed to convert HTML to PNG');
    }
});

nApiRouter.get('/capture/pdf', async (req, res) => {
    const targetURL = req.query.url;
    if (!targetURL) {
        return res.status(400).send('URL is required as a query parameter');
    }

    try {
        const pdf = await captureURLToPDF(targetURL);
        res.set('Content-Type', 'application/pdf');
        res.send(pdf);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send('Failed to capture URL to PDF');
    }
});

nApiRouter.get('/capture/png', async (req, res) => {
    const targetURL = req.query.url;
    if (!targetURL) {
        return res.status(400).send('URL is required as a query parameter');
    }

    try {
        const png = await captureURLToPNG(targetURL);
        res.set('Content-Type', 'image/png');
        res.send(png);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send('Failed to capture URL to PNG');
    }
});

nApiRouter.get('/ping', (req, res) => {
    res.send('pong');
});

app.use('/napi', nApiRouter);


app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});
