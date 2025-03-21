import React from "react";
import editIcon from "../../assets/icons/edit.svg";
import deleteIcon from "../../assets/icons/delete.svg";
import closeIcon from "../../assets/icons/close.svg";
import usersIcon from "../../assets/icons/users.svg";

const EventCard = ({
  onClose,
  handleRemoveEvent,
}: {
  onClose: () => void;
  handleRemoveEvent: () => void;
}) => {
  return (
    <div className="w-full h-full bg-white space-y-6">
      <div className="flex w-full items-center justify-end gap-3">
        <img src={editIcon} className="cursor-pointer" />
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
        <h2 className="text-xl font-semibold">STAnley Make-up Class</h2>
      </div>
      <p className="text-gray-600">
        Wednesday, January 27. 10:00-10:30 pm
        <br />
        Weekly on Wednesday
      </p>
      <div>
        <div className="flex gap-2 items-start">
          <img src={usersIcon} className="w-6" />
          <div>
            <p className="text-gray-900 font-semibold">10 Slots</p>
            <p className="text-gray-400">3 Invited 7 Available</p>
            <div className="max-h-30 overflow-y-scroll space-y-2 mt-2">
              {Array(3)
                .fill("Paul Mwangi")
                .map((name, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                    <p className="text-gray-700 text-sm">{name}</p>
                  </div>
                ))}
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
        <p className="text-gray-700">Raymond</p>
      </div>
      <button className="w-full bg-green-600 text-white py-2 rounded-lg text-lg font-semibold hover:bg-green-700">
        + Add Clients
      </button>
    </div>
  );
};

export default EventCard;
