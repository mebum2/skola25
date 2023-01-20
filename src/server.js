const path = require('path');
const fs = require('fs');

const express = require('express');
const app = express();

/* ------------------------------- Middlewares ------------------------------ */

// HTTP loggers
app.use(require('morgan')('dev'));
// app.use(require('pino-http')({ prettyPrint: true }));

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.json());

/* --------------------------------- Routes --------------------------------- */

app.get(['/', '/downloading'], (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'main.html'));
});

app.post('/create-calendar', async (req, res) => {
    const calendar__raw_data = await require('./services/webscrape')(req.body);

    if (!Array.isArray(calendar__raw_data) || calendar__raw_data.length === 0) return;

    const calendar__formatted_data = require('./services/extract_calendar_data')(
        calendar__raw_data
    );

    const calendar_string__constructed = require('./services/calendar_formatted_string')(
        calendar__formatted_data
    );

    const file_path = path.join(
        __dirname,
        '..',
        'data',
        'created-calendars',
        'school.ics'
    );

    fs.writeFileSync(file_path, calendar_string__constructed);

    return res.download(file_path);
});

module.exports = app;
