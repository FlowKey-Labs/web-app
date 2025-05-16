import { useState } from "react";
import { useForm, SubmitHandler, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Button from "../common/Button";
import DropdownSelectInput from "../common/Dropdown";
import { useGetRoles } from "../../hooks/reactQuery";
import { Role } from "../../store/auth";

type PayType = "hourly" | "salary" | "commission";

const payTypeOptions = [
  { value: "hourly", label: "Hourly" },
  { value: "salary", label: "Salary" },
  { value: "commission", label: "Commission" },
];

interface RoleData {
  role: string;
  payType: PayType;
  hourlyRate?: string;
}

interface RoleFormData {
  roles: RoleData[];
}

interface NewStaffRolesProps {
  onNext: (data: RoleData) => void;
  onBack: () => void;
  initialData?: RoleData;
}

const roleSchema = yup.object({
  role: yup
    .string()
    .required("Role is required"),
  payType: yup
    .string()
    .oneOf(["hourly", "salary", "commission"] as const, "Invalid pay type")
    .required("Pay type is required"),
  hourlyRate: yup
    .string()
    .test(
      "conditional-hourly-rate",
      "Hourly rate is required for hourly pay type",
      function (value, context) {
        if (context.parent.payType === "hourly") {
          if (!value) return false;
          return /^\d+\.?\d{0,2}$/.test(value);
        }
        return true;
      }
    ),
});

const formSchema = yup.object({
  roles: yup.array().of(roleSchema).min(1).required(),
});

const NewStaffRoles = ({ onNext, onBack, initialData }: NewStaffRolesProps) => {
  const { data: roles = [] } = useGetRoles();
  const [showHourlyRate, setShowHourlyRate] = useState(
    initialData?.payType === "hourly"
  );

  const methods = useForm<RoleFormData>({
    resolver: yupResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      roles: [
        {
          role: initialData?.role || "staff",
          payType: initialData?.payType || "hourly",
          hourlyRate: initialData?.hourlyRate || "",
        },
      ],
    },
  });

  const onSubmit: SubmitHandler<RoleFormData> = (data) => {
    onNext(data.roles[0]);
  };

  return (
    <FormProvider {...methods}>
      <div className="flex flex-col space-y-6 w-[100%] h-full">
        <h3 className="text-[32px] font-semibold text-primary px-4">Role</h3>
        <p className="text-primary text-sm px-4">
          Manage staff's role and compensation
        </p>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="space-y-4 h-full flex flex-col"
        >
          <div className="flex-grow overflow-y-auto px-2 space-y-8">
            <div className="space-y-4 pb-8">
              <DropdownSelectInput
                label="Role"
                options={roles.map((role: Role) => ({
                  label: role.name,
                  value: role.id,
                }))}
                placeholder="Select role"
                value={methods.watch("roles.0.role")}
                onSelectItem={(selectedItem) =>
                  methods.setValue(`roles.0.role`, selectedItem.value)
                }
                createLabel="Create new role"
                createDrawerType="role"
                hasError={!!methods.formState.errors.roles?.[0]?.role}
                errorMessage={
                  methods.formState.errors.roles?.[0]?.role?.message
                }
              />

              <DropdownSelectInput
                label="Pay Type"
                options={payTypeOptions}
                placeholder="Select pay type"
                value={methods.watch("roles.0.payType")}
                onSelectItem={(selectedItem) => {
                  const payType = selectedItem.value as PayType;
                  methods.setValue(`roles.0.payType`, payType);
                  setShowHourlyRate(payType === "hourly");
                  if (payType !== "hourly") {
                    methods.setValue(`roles.0.hourlyRate`, "");
                  }
                }}
                hasError={!!methods.formState.errors.roles?.[0]?.payType}
                errorMessage={
                  methods.formState.errors.roles?.[0]?.payType?.message
                }
              />

              {showHourlyRate && (
                <div className="relative">
                  <input
                    type="text"
                    {...methods.register(`roles.0.hourlyRate`)}
                    className={`w-full px-4 pt-8 pb-2 border text-sm text-gray-500 ${
                      methods.formState.errors.roles?.[0]?.hourlyRate
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-lg focus:ring-1 ${
                      methods.formState.errors.roles?.[0]?.hourlyRate
                        ? "focus:ring-red-500"
                        : "focus:ring-[#1D9B5E]"
                    } focus:border-transparent outline-none`}
                    placeholder="Ksh 0.00"
                  />
                  <label
                    htmlFor={`roles.0.hourlyRate`}
                    className="absolute top-2 left-4 text-xs text-primary"
                  >
                    Hourly Rate (KES)
                  </label>
                  {methods.formState.errors.roles?.[0]?.hourlyRate && (
                    <p className="text-sm text-red-500 mt-1">
                      {
                        methods.formState.errors.roles?.[0]?.hourlyRate
                          ?.message as string
                      }
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between w-full mt-8 self-end">
            <Button
              variant="outline"
              type="button"
              onClick={onBack}
              radius="md"
              color="#1D9B5E"
              w={100}
              h={52}
              style={{
                color: "#1D9B5E",
                fontSize: "14px",
                fontWeight: "700",
              }}
            >
              Back
            </Button>
            <Button
              radius="md"
              w={120}
              h={52}
              type="submit"
              disabled={!methods.formState.isValid}
              style={{
                backgroundColor: "#1D9B5E",
                color: "#FFF",
                fontSize: "14px",
                fontWeight: "700",
              }}
            >
              Continue
            </Button>
          </div>
        </form>
      </div>
    </FormProvider>
  );
};

export default NewStaffRoles;
