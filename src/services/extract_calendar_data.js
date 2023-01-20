const date_fns = require('date-fns');

// const calendar__raw_data = [
//     ['33', 'Onsdag 09:00 - 13:30', 'Skolstart'],
//     ['33', 'Torsdag 08:30 - 10:15', 'Datalagring', 'OLR', 'E212'],
//     ['33', 'Torsdag 10:30 - 12:00', 'Teknisk specialisering', 'PEFR', 'E212'],
//     ['33', 'Torsdag 12:40 - 14:10', 'Gy ingenjören i praktiken', 'OLL', 'E229'],
//     ['33', 'Fredag 08:30 - 10:00', 'Gy ingenjören i praktiken', 'ÅSI', 'E229'],
//     ['33', 'Fredag 10:20 - 12:10', 'Mjukvarudesign', 'OLR', 'E212'],
//     ['33', 'Fredag 12:50 - 14:30', 'Webbutveckling', 'PEFR', 'E212'],
// ];

module.exports = function extract_calendar_data(calendar__raw_data) {
    return calendar__raw_data.map(calendar_block__raw_data => {
        const week_number = calendar_block__raw_data[0];
        const week_day_and_time__obscure_string = calendar_block__raw_data[1];

        const { start__date_time, end__date_time } = extract_date_time(
            week_number,
            week_day_and_time__obscure_string
        );

        return {
            start__date_time,
            end__date_time,
            lesson_title: calendar_block__raw_data[2],
            teacher_id: calendar_block__raw_data[3],
            classroom_id: calendar_block__raw_data[4],
        };
    });
};

function extract_date_time(week_number, week_day_and_time__obscure_string) {
    const swedish_week_day__names = [
        'måndag',
        'tisdag',
        'onsdag',
        'torsdag',
        'fredag',
        'lördag',
        'söndag',
    ];

    const week_day_and_time__obscure_array = week_day_and_time__obscure_string.split(' ');

    const week_day = week_day_and_time__obscure_array[0].toLowerCase();
    const start__time_string = week_day_and_time__obscure_array[1];
    // throw away: week_day_and_time__obscure_array[2]
    const end__time_string = week_day_and_time__obscure_array[3];

    const week_day__index = swedish_week_day__names.indexOf(week_day);

    //! Hard coded year
    const YEAR = 2021;
    const date = date_fns.add(first_date_of_iso_week(week_number, YEAR), {
        days: week_day__index,
    });

    const start__date_time = set_date_time(date, start__time_string);
    const end__date_time = set_date_time(date, end__time_string);

    return { start__date_time, end__date_time };
}

function first_date_of_iso_week(week, year) {
    const date_of_week = first_date_of_week(week, year);
    const date_of_iso_week = date_of_week;

    if (date_of_week.getDay() <= 4) {
        return date_of_iso_week.setDate(
            date_of_week.getDate() - date_of_week.getDay() + 1
        );
    }
    return date_of_iso_week.setDate(date_of_week.getDate() + 8 - date_of_week.getDay());
}

function first_date_of_week(week, year) {
    const date_number = 1 + (week - 1) * 7; // 1st of January + 7 days for each week
    return new Date(year, 0, date_number);
}

function set_date_time(date, time_string) {
    time_array = time_string.split(':');
    const hours = time_array[0];
    const minutes = time_array[1];

    return date_fns.setMinutes(date_fns.setHours(date, hours), minutes);
}
