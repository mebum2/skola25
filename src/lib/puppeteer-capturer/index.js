const path = require('path');
const fs = require('fs');

module.exports = function capturer(page, screenshot__dir_path) {
    async function* screenshot_generator() {
        let i = 0;
        while (true) {
            const label = yield i++;

            // format to set number of digits
            const index = '0'.repeat(2 - i.toString().length) + i.toString();

            const file_name = index + '-' + label + '.png';
            await page.screenshot({
                path: path.join(screenshot__dir_path, file_name),
            });
        }
    }

    const capture = screenshot_generator(page);
    capture.next();

    fs.readdir(screenshot__dir_path, (err, files) => {
        if (err) throw err;

        for (const file of files) {
            fs.unlink(path.join(screenshot__dir_path, file), err => {
                if (err) throw err;
            });
        }
    });

    // Create capture shorthand
    return function capture_next(label) {
        capture.next(label);
    };
};
