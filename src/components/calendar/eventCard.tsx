import editIcon from "../../assets/icons/edit.svg";
import deleteIcon from "../../assets/icons/delete.svg";
import closeIcon from "../../assets/icons/close.svg";
import usersIcon from "../../assets/icons/users.svg";
import { Dictionary } from "@fullcalendar/core/internal";
import moment from "moment";
import { subHours } from "date-fns";

const formatSessionInfo = (
  session: any
): { dateStr: string; repeatStr: string } => {
  if (!session) {
    return { dateStr: "", repeatStr: "" };
  }

  const start = moment(subHours(new Date(session.start_time), 3));
  const end = moment(subHours(new Date(session.end_time), 3));

  const dateStr = `${start.format("dddd, MMMM D")}⋅${start.format(
    "h:mma"
  )} – ${end.format("h:mma")}`;

  let repeatStr = "";
  if (
    session.repeat_every &&
    session.repeat_unit &&
    session.repeat_on?.length
  ) {
    const pluralUnit =
      session.repeat_every > 1
        ? `${session.repeat_unit}s`
        : session.repeat_unit;
    const repeatDays = session.repeat_on.join(", ");
    repeatStr = `Every ${session.repeat_every} ${pluralUnit} on ${repeatDays}`;
  }

  return { dateStr, repeatStr };
};

const EventCard = ({
  data,
  onClose,
  handleRemoveEvent,
  handleEditEvent,
}: {
  data: Dictionary;
  onClose: () => void;
  handleRemoveEvent: () => void;
  handleEditEvent: (id: string) => void;
}) => {
  const attendances = data?.session?.attendances || [];
  const invitedCount = attendances.filter(
    (a: { attended: boolean }) => !a.attended
  ).length;
  const attendedCount = attendances.filter(
    (a: { attended: boolean }) => a.attended
  ).length;
  const { dateStr, repeatStr } = formatSessionInfo(data?.session || {});

  return (
    <div className="w-full h-full bg-white space-y-4">
      <div className="flex w-full items-center justify-end gap-3">
        <img src={editIcon} className="cursor-pointer" onClick={() => handleEditEvent(data?.session?.id)} />
        <img
          src={deleteIcon}
          className="cursor-pointer"
          onClick={() => handleRemoveEvent?.()}
        />
        <img
          src={closeIcon}
          className="cursor-pointer"
          onClick={() => onClose?.()}
        />
      </div>
      <div className="flex items-start space-x-2 items-center">
        <span className="w-3 h-3 bg-blue-500 rounded-full mt-1" />
        <h2 className="text-xl font-semibold">{data?.session?.title}</h2>
      </div>
      <p className="text-gray-600 whitespace-pre-line">
        {dateStr}
        {repeatStr && `\n${repeatStr}`}
      </p>
      <div>
        <div className="flex gap-2 items-start">
          <img src={usersIcon} className="w-6" />
          <div>
            <p className="text-gray-900 font-semibold">
              {data?.session?.spots} Slots
            </p>
            <p className="text-gray-400">
              {invitedCount} Invited · {attendedCount} Attended
            </p>
            <div className="max-h-30 overflow-y-scroll space-y-2 mt-2">
              {data?.session?.attendances.map(
                (user: { client_name: string }, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                    <p className="text-gray-700 text-sm">{user?.client_name}</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <span className="w-5 h-5 text-gray-500">⏰</span>
        <p className="text-gray-700">30 minutes before</p>
      </div>
      <div className="flex items-center space-x-2">
        <span className="w-5 h-5 text-gray-500">📅</span>
        <p className="text-gray-700">
          {data?.session?.assigned_staff?.user?.first_name}{" "}
          {data?.session?.assigned_staff?.user?.last_name}
        </p>
      </div>
      <button
        onClick={() => handleEditEvent(data?.session?.id)}
        className="w-full bg-green-600 text-white py-2 rounded-lg text-lg font-semibold hover:bg-green-700"
      >
        + Add Clients
      </button>
    </div>
  );
};

export default EventCard;
