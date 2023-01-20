const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

module.exports = async function (options) {
    console.log('options', options);
    const config = {
        schedule_id__value: options.schedule_id,
        week_number__value: options.week_number,
        school_name__value: options.school_name,
        city_name__value: options.city_name,
    };
    console.log(`config`, config);

    if (
        typeof config.schedule_id__value == 'undefined' ||
        config.schedule_id__value == ''
    ) {
        console.error('Error: invalid schedule_id');
        return;
    }

    const browser = await puppeteer.launch({ headless: false, slowMo: 0 });
    const page = (await browser.pages())[0];
    // const page = await browser.newPage();

    // Do the webscraping
    try {
        return await webscrape(page, config);
    } catch (error) {
        console.error(error);
    } finally {
        // console.log('Close the browser');
        await browser.close();
    }
};

async function webscrape(page, config) {
    // const capture = require('../lib/puppeteer-capturer')(
    //     page,
    //     path.join(__dirname, '..', '..', 'data', 'puppeteer_captures')
    // );

    const school_name__value_capitalcase = config.school_name__value
        .toLowerCase()
        .replace(/^\w/, c => c.toUpperCase());
    const city_name__value_lowercase = config.city_name__value.toLowerCase();
    await page.goto(
        `https://web.skola24.se/timetable/timetable-viewer/${city_name__value_lowercase}.skola24.se/${school_name__value_capitalcase}/`
    );

    // Turn off css animations
    await page.evaluate(() => {
        const style__elem = document.createElement('style');
        style__elem.innerHTML = `* {
    -webkit-animation: none !important;
    -moz-animation: none !important;
    -o-animation: none !important;
    -ms-animation: none !important;
    animation: none !important;
}`;
        document.head.appendChild(style__elem);
    });

    await page.waitForTimeout(900);

    /* ----------------------------- Set Schedule ID ---------------------------- */

    const schedule_id__XPath =
        '/html/body/div[3]/div[2]/div/div[2]/div[1]/div[1]/div[6]/div/div/input';
    await page.waitForXPath(schedule_id__XPath);

    const [schedule_id__elem] = await page.$x(schedule_id__XPath);
    await schedule_id__elem.type(config.schedule_id__value);

    /* --------------------------- Press "show" button -------------------------- */

    const [show__button_elem] = await page.$x(
        '/html/body/div[3]/div[2]/div/div[2]/div[1]/div[1]/div[6]/div/div/button'
    );
    await show__button_elem.click();

    // Wait for the calendar blocks to load
    // await page.waitForSelector('rect');
    await page.waitForTimeout(900); // Magic value

    const calendar_block__check__elems = await page.$$('rect');

    // Check if calender blocks got loaded
    if (calendar_block__check__elems.length <= 0) {
        console.error('Rejected schedule_id');
        return;
    }

    /* --------------------------- Select week number --------------------------- */

    {
        if (
            typeof config.week_number__value == 'undefined' ||
            config.week_number__value == ''
        )
            return;

        const [week_number__button_elem] = await page.$x(
            '/html/body/div[3]/div[2]/div/div[2]/div[1]/div[1]/div[2]/div/div/button'
        );
        await week_number__button_elem.click();

        await page.keyboard.type('.' + config.week_number__value);

        const week_number__first_dropdown_elem_item__XPath =
            '/html/body/div[3]/div[2]/div/div[2]/div[1]/div[1]/div[2]/div/div/ul/li';

        await page.waitForXPath(week_number__first_dropdown_elem_item__XPath);

        const [week_number__first_dropdown_elem_item] = await page.$x(
            week_number__first_dropdown_elem_item__XPath
        );
        await week_number__first_dropdown_elem_item.click();

        await page.waitForTimeout(300); // Magic value
    }

    /* ---------------------- Loop through calendar blocks ---------------------- */

    const calendar_block__elems = await page.$$('rect');

    let calendar__raw_data = [];

    for (const calendar_block__elem of calendar_block__elems) {
        if (
            (await calendar_block__elem.evaluate(elem =>
                elem.getAttribute('box-type')
            )) != 'Lesson'
        ) {
            continue;
        }

        await page.waitForTimeout(500); // Magic value

        await calendar_block__elem.click();

        await page.waitForTimeout(500); // Magic value

        const header__elem__XPath =
            '/html/body/div[3]/div[2]/div/div[4]/div/div/div[1]/div/div/div[1]/h2';

        await page.waitForXPath(header__elem__XPath);

        const [header__elem] = await page.$x(header__elem__XPath);
        const header__elem__json = await header__elem.getProperty('textContent');
        const header__elem__text = await header__elem__json.jsonValue();
        let calendar_block__data = [config.week_number__value, header__elem__text];

        const detail__elems = await page.$x(
            '/html/body/div[3]/div[2]/div/div[4]/div/div/div[1]/div/div/div[2]/ul/li/div/div'
        );

        for (const detail__elem of detail__elems) {
            const detail__elem__json = await detail__elem.getProperty('textContent');
            const detail__elem__text = await detail__elem__json.jsonValue();
            calendar_block__data.push(detail__elem__text.trim());
        }

        calendar__raw_data.push(calendar_block__data);

        const close__button__XPath =
            '/html/body/div[3]/div[2]/div/div[4]/div/div/div[2]/div/button';
        await page.waitForXPath(close__button__XPath);

        const [close__button] = await page.$x(close__button__XPath);
        await close__button.click();

        await page.waitForTimeout(500); // Magic value
    }

    return calendar__raw_data;
}
