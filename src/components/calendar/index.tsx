import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import dayGridWeek from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useRef, useState } from "react";
import './index.css'

const events = [
  {
    title: "Meeting",
    start: new Date(),
    backgroundColor: "rgba(29, 155, 94, 0.2)",
  },
];


const CalendarView = () => {
    const calendarRef = useRef<FullCalendar>(null);
    const [currentView, setCurrentView] = useState("dayGridMonth");
  
    // const toggleView = () => {
    //   const nextView =
    //     currentView === "dayGridMonth"
    //       ? "timeGridWeek"
    //       : currentView === "timeGridWeek"
    //       ? "timeGridDay"
    //       : "dayGridMonth";
  
    //   setCurrentView(nextView);
    //   calendarRef.current?.getApi().changeView(nextView);
    // };
    const changeView = (view: string) => {
        setCurrentView(view);
        calendarRef.current?.getApi().changeView(view);
      };

    const customButtons = {
        myCustomButton: {
            text: "Toggle View",
            // click: toggleView,
        }
      }

    const headerToolbar = 
      {
        start: 'title,myCustomButton',
        center: '',
        end: ''
      }
  return (
    <div>
      <div className="mb-4">
        <select
          id="viewSelect"
          value={currentView}
          onChange={(e) => changeView(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="dayGridMonth">Month</option>
          <option value="timeGridWeek">Week</option>
          <option value="timeGridDay">Day</option>
        </select>
      </div>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, dayGridWeek]}
        initialView={currentView}
        events={events}
        eventContent={renderEventContent}
        dayMaxEventRows={true}
        headerToolbar={headerToolbar}
        customButtons={customButtons}
        height={'100vh'}
      />
    </div>
  );
};

function renderEventContent(eventInfo: {
  timeText: string;
  event: { title: string };
}) {
  return (
    <div className="flex items-end w-full h-full">
      <b>{eventInfo.timeText}</b>
      <i>{eventInfo.event.title}</i>
    </div>
  );
}

export default CalendarView;
