export interface FormData {
  profile?: {
    preferedName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    userId: string;
  };
  role?: {
    role: string;
    payType: string;
    hourlyRate: string;
  };
  permissions?: {
    createEvents: boolean;
    addClients: boolean;
    createInvoices: boolean;
  };
}
