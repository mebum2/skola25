const fs = require('fs');

const calendar__raw_data = [
    ['33', 'Onsdag 09:00 - 13:30', 'Skolstart'],
    ['33', 'Torsdag 08:30 - 10:15', 'Datalagring', 'OLR', 'E212'],
    ['33', 'Torsdag 10:30 - 12:00', 'Teknisk specialisering', 'PEFR', 'E212'],
    ['33', 'Torsdag 12:40 - 14:10', 'Gy ingenjören i praktiken', 'OLL', 'E229'],
    ['33', 'Fredag 08:30 - 10:00', 'Gy ingenjören i praktiken', 'ÅSI', 'E229'],
    ['33', 'Fredag 10:20 - 12:10', 'Mjukvarudesign', 'OLR', 'E212'],
    ['33', 'Fredag 12:50 - 14:30', 'Webbutveckling', 'PEFR', 'E212'],
];

const calendar__formatted_data = require('../src/services/extract_calendar_data')(
    calendar__raw_data
);

const calendar_string__constructed = require('../src/services/calendar_formatted_string')(
    calendar__formatted_data
);

fs.writeFileSync(
    `${__dirname}/../,local/,created-calendars/school.ics`,
    calendar_string__constructed
);

// console.log('🚀: calendar_string__constructed', calendar_string__constructed);
