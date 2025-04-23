import { useCallback, useEffect, useRef, useState } from "react";
import Calendar from "@toast-ui/react-calendar";
import "@toast-ui/calendar/dist/toastui-calendar.min.css";
import FullCalendar from "@fullcalendar/react";
import Button from "../common/Button";
import plusIcon from "../../assets/icons/plusWhite.svg";
import { addHours, format, isPast, parse, subHours } from "date-fns";
import DropDownMenu from "../common/DropdownMenu";
import dropdownIcon from "../../assets/icons/dropIcon.svg";
import { cn } from "../../utils/mergeClass";
import { useGetSessions } from "../../hooks/reactQuery";
import AddSession from "../sessions/AddSession";
import "./index.css";
import AddClients from "../clients/AddClient";
import moment from "moment";
import { EventImpl } from "@fullcalendar/core/internal.js";

type CalendarView = {
  type: string;
  view: string;
  tuiView: "day" | "week" | "month";
};

const calendarViews: CalendarView[] = [
  {
    type: "Month",
    view: "dayGridMonth",
    tuiView: "month",
  },
  {
    type: "Week",
    view: "timeGridWeek",
    tuiView: "week",
  },
  {
    type: "Day",
    view: "timeGridDay",
    tuiView: "day",
  },
];

const CalendarView = () => {
  const calendarRef = useRef<FullCalendar>(null);
  const [currentView, setCurrentView] = useState<CalendarView>(
    calendarViews[0]
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventImpl | null>(null);
  const { data: sessionsData } = useGetSessions();
  console.log("sessionsData==>", sessionsData);

  const changeView = (view: CalendarView) => {
    setCurrentView(view);
    calendarRef.current?.getApi().changeView(view.view);
    setDropdownOpen(false);
  };

  const handleAddEvent = () => {
    setIsModalOpen(true);
  };

  //   (eventInfo: {
  //     timeText: string;
  //     event: {
  //       extendedProps: { session: { date: string } };
  //       title: string;
  //     };
  //   }) => {
  //     const time = parse(eventInfo.timeText, "HH:mm", new Date());
  //     const formattedTime = addHours(time, -3);

  //     return (
  //       <div className="flex justify-between w-full h-full py-1 cursor-pointer">
  //         <div
  //           className={cn("flex items-center gap-1 w-[70%]", {
  //             "w-[40%]": currentView.type === "Week",
  //           })}
  //         >
  //           <div
  //             className={cn("rounded-full w-2 h-2 bg-green-400", {
  //               "bg-gray-500": isPast(
  //                 new Date(eventInfo.event.extendedProps.session.date)
  //               ),
  //             })}
  //           />
  //           <i className="text-xs truncate">{eventInfo.event.title}</i>
  //         </div>
  //         <b className="text-xs flex items-center">
  //           {format(formattedTime, "HH:mm a")}
  //         </b>
  //       </div>
  //     );
  //   },
  //   [currentView]
  // );

  // Map sessions to TUI Calendar format
  const mapSessionToTUIEvents = useCallback((session: any) => {
    const events: any[] = [];
    const startDate = new Date(session.date);
    const repeatEndDate = new Date(session.repeat_end_date || session.date);
    const startTime = new Date(session.start_time);
    const endTime = new Date(session.end_time);

    const mergeDateAndTime = (date: Date, time: Date): Date => {
      const merged = new Date(date);
      merged.setHours(
        time.getUTCHours(),
        time.getUTCMinutes(),
        time.getUTCSeconds()
      );
      return merged;
    };

    if (session.repeat_on && session.repeat_on.length > 0) {
      const currentDate = new Date(startDate);
      const daysOfWeek = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];

      while (currentDate <= repeatEndDate) {
        const weekday = currentDate.getDay();
        const weekdayName = daysOfWeek[weekday];

        if (
          session.repeat_on.includes(
            weekdayName.charAt(0).toUpperCase() + weekdayName.slice(1)
          )
        ) {
          const eventStart = mergeDateAndTime(currentDate, startTime);
          const eventEnd = mergeDateAndTime(currentDate, endTime);

          events.push({
            id: `${session.id}-${eventStart.toISOString()}`,
            calendarId: "1",
            title: session.title,
            start: eventStart,
            end: eventEnd,
            category: "time",
            isReadOnly: true,
            raw: {
              session,
            },
            backgroundColor: isPast(eventStart) ? "#9CA3AF" : "#10B981",
            borderColor: isPast(eventStart) ? "#9CA3AF" : "#10B981",
          });
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }
    } else {
      const eventStart = new Date(session.start_time);
      const eventEnd = new Date(session.end_time);

      events.push({
        id: `${session.id}`,
        calendarId: "1",
        title: session.title,
        start: eventStart,
        end: eventEnd,
        category: "time",
        isReadOnly: true,
        raw: {
          session,
        },
        backgroundColor: isPast(eventStart) ? "#9CA3AF" : "#10B981",
        borderColor: isPast(eventStart) ? "#9CA3AF" : "#10B981",
      });
    }

    return events;
  }, []);

  const handleRemoveEvent = () => {
    if (selectedEvent) {
      selectedEvent.remove();
      setSelectedEvent(null);
    }
  };

  // Customize the popup template
  const customizePopup = useCallback(() => {
    if (!calendarRef.current) return;

    const calendarInstance = calendarRef.current.getInstance();

    calendarInstance.on("clickEvent", () => {
      console.log("here");
    });

    // Customize the popup template
    calendarInstance.setOptions({
      template: {
        popupDetailTitle: (event: any) => {
          return `
            <div class="flex items-start space-x-2 items-center">
              <span class="w-3 h-3 bg-blue-500 rounded-full mt-1"></span>
              <h2 class="text-xl font-semibold">${event.title}</h2>
            </div>
          `;
        },
        popupDetailDate: (event: any) => {
          const startDate = moment(new Date(event.start));
          const endDate = moment(new Date(event.end));

          return `
            <p class="text-gray-600">
              ${startDate.format("dddd, MMMM D")}⋅${startDate.format(
            "h:mma"
          )} – ${endDate.format("h:mma")}
            </p>
          `;
        },
        popupDetailBody: (event: any) => {
          console.log("event===>", event);

          const session = event.raw?.session || {};
          const attendances = session.attendances || [];
          const invitedCount = attendances.filter(
            (a: any) => !a.attended
          ).length;
          const attendedCount = attendances.filter(
            (a: any) => a.attended
          ).length;

          return `
            <div class="space-y-4">
              ${
                session.repeat_every &&
                session.repeat_unit &&
                session.repeat_on?.length
                  ? `
                <p class="text-gray-600">
                  Every ${session.repeat_every} ${
                      session.repeat_every > 1
                        ? `${session.repeat_unit}s`
                        : session.repeat_unit
                    } 
                  on ${session.repeat_on.join(", ")}
                </p>
              `
                  : ""
              }
              
              <div>
                <div class="flex gap-2 items-start">
                  <img src="" class="w-6" />
                  <div>
                    <p class="text-gray-900 font-semibold">${
                      session.spots || 0
                    } Slots</p>
                    <p class="text-gray-400">${invitedCount} Invited · ${attendedCount} Attended</p>
                    <div class="max-h-30 overflow-y-scroll space-y-2 mt-2">
                      ${attendances
                        .map(
                          (user: any) => `
                        <div class="flex items-center space-x-2">
                          <span class="w-3 h-3 bg-blue-500 rounded-full"></span>
                          <p class="text-gray-700 text-sm">${
                            user?.client_name || ""
                          }</p>
                        </div>
                      `
                        )
                        .join("")}
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="flex items-center space-x-2">
                <span class="w-5 h-5 text-gray-500">⏰</span>
                <p class="text-gray-700">30 minutes before</p>
              </div>
              
              <div class="flex items-center space-x-2">
                <span class="w-5 h-5 text-gray-500">📅</span>
                <p class="text-gray-700">${
                  session.assigned_staff?.user?.first_name || ""
                } ${session.assigned_staff?.user?.last_name || ""}</p>
              </div>
              
              <button 
                id="addClientsBtn" 
                class="w-full bg-green-600 text-white py-2 rounded-lg text-lg font-semibold hover:bg-green-700"
              >
                + Add Clients
              </button>
            </div>
          `;
        },
        popupDetailEdit: () => "", // Hide edit button
        popupDetailClose: () => "", // Hide close button
      },
      useDetailPopup: true,
    });

    // Add event listener for the Add Clients button
    document.addEventListener("click", (e) => {
      if ((e.target as HTMLElement).id === "addClientsBtn") {
        const popup = document.querySelector(".tui-calendar-popup-detail");
        if (popup) {
          const eventId = popup.getAttribute("data-event-id");
          if (eventId) {
            const event = calendarInstance.getEvent(eventId, "1");
            setSelectedEvent(event);
            setIsModalOpen(true);
          }
        }
      }
    });
  }, []);

  useEffect(() => {
    if (calendarRef.current) {
      const calendarInstance = calendarRef.current.getInstance();

      customizePopup();

      // Set event handlers
      calendarInstance.on("clickEvent", (eventObj: any) => {
        // You can still track the selected event if needed
        setSelectedEvent(eventObj.event);
      });

      // calendarInstance.on("selectDateTime", setIsModalOpen(!isModalOpen));

      // Set theme
      calendarInstance.setTheme({
        // ... your theme configuration ...
      });
    }
  }, [customizePopup]);

  // Custom template for events
  const eventTemplate = useCallback(
    (event: any) => {
      const time = parse(format(event.start, "HH:mm"), "HH:mm", new Date());
      const formattedTime = addHours(time, -3);

      return `
      <div class="flex justify-between w-full h-full py-1 cursor-pointer">
        <div class="${cn("flex items-center gap-1 w-[70%]", {
          "w-[40%]": currentView.type === "Week",
        })}">
          <i class="text-xs truncate">${event.title}</i>
        </div>
        <b class="text-xs flex items-center">
          ${format(formattedTime, "HH:mm a")}
        </b>
      </div>
    `;
    },
    [currentView]
  );

  return (
    <div className="pt-5 px-5 bg-[#f5f5f5]">
      <h1 className="text-[32px] font-bold text-primary pb-4">Calendar</h1>
      <div className="relative pt-5 bg-white">
        <div className="absolute top-5 left-[250px]">
          <DropDownMenu
            show={dropdownOpen}
            setShow={setDropdownOpen}
            dropDownPosition="center"
            actionElement={
              <div
                id="viewSelect"
                className="p-2 border rounded w-20 h-10 outline-none cursor-pointer flex items-center justify-between"
              >
                <p>{currentView?.type}</p>
                <img src={dropdownIcon} />
              </div>
            }
          >
            {calendarViews.map((view) => (
              <div
                className={cn("w-20 p-2 cursor-pointer hover:bg-[#DAF8E6]", {
                  "bg-[#EAFCF3]": view.type === currentView.type,
                })}
                onClick={() => changeView(view)}
              >
                <p>{view.type}</p>
              </div>
            ))}
          </DropDownMenu>
        </div>
        <div className="">
          <Button
            w={140}
            h={52}
            size="sm"
            radius="md"
            leftSection={<img src={plusIcon} alt="Icon" className="w-3 h-3" />}
            style={{
              backgroundColor: "#1D9B5E",
              color: "#fff",
              fontSize: "16px",
            }}
            onClick={handleAddEvent}
          >
            New Event
          </Button>
        </div>
        <div style={{ height: "calc(100vh - 200px)" }}>
          <Calendar
            ref={calendarRef}
            usageStatistics={false}
            calendars={[
              {
                id: "1",
                name: "Default",
                backgroundColor: "#1D9B5E",
              },
            ]}
            events={sessionsData?.flatMap(mapSessionToTUIEvents)}
            template={{
              time: eventTemplate,
            }}
            useFormPopup={false}
            isReadOnly={false}
            view={currentView.tuiView}
            week={{
              showTimezoneCollapseButton: false,
              timezonesCollapsed: false,
              hourStart: 0,
              hourEnd: 24,
              taskView: false,
              eventView: ["time"],
              collapseDuplicateEvents: false,
            }}
            month={{
              dayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
              visibleWeeksCount: 6,
              startDayOfWeek: 0,
            }}
            timezone={{
              zones: [
                {
                  timezoneName: "UTC",
                  displayLabel: "UTC",
                },
              ],
            }}
          />
        </div>
      </div>
      <AddSession isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <AddClients
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
};

export default CalendarView;
