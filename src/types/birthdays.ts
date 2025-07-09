export type BirthdayPerson = {
  id: number;
  first_name: string;
  last_name: string;
  dob: string; // ISO date format (YYYY-MM-DD)
  age: number;
  birthday_date: string; // ISO date format (YYYY-MM-DD)
  day_of_week: string;
};

export type UpcomingBirthdaysResponse = {
  start_date: string; // ISO date format (YYYY-MM-DD)
  end_date: string; // ISO date format (YYYY-MM-DD)
  upcoming_birthdays: BirthdayPerson[];
};
