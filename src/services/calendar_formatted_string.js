const ics = require('ics');
const date_fns = require('date-fns');

module.exports = function calendar_formatted_string(calendar__data) {
    const calendar__ics_events = calendar_data_to_ics_events(calendar__data);
    const ics_calendar = ics.createEvents(calendar__ics_events);

    if (ics_calendar.error) {
        console.error(error);
        return;
    }

    return ics_calendar.value;
};

function calendar_data_to_ics_events(calendar__data) {
    return calendar__data.map((calendar_block__data) => {
        const calendar_block__ics_data = {
            start: date_time_array(calendar_block__data.start__date_time),
            end: date_time_array(calendar_block__data.end__date_time),
            title: calendar_block__data.lesson_title,
            location: calendar_block__data.classroom_id,
            description: calendar_block__data.teacher_id,
        };
        return calendar_block__ics_data;
    });
}

function date_time_array(date_time) {
    return [
        date_fns.getYear(date_time),
        date_fns.getMonth(date_time) + 1, // e.g January should be 1 not 0
        date_fns.getDate(date_time),
        date_fns.getHours(date_time),
        date_fns.getMinutes(date_time),
    ];
}
