"use client";

import {
  getAvailableCitiesForShipping,
  getAvailableCountriesForShipping,
  getAvailableStatesForShipping,
} from "@/actions";
import { ShippingAddressFormData } from "@/schemas/checkoutSchema";
import { IApiResponse } from "@/types/Api.types";
import { Address } from "@/types/Checkout.types";
import { ICity, ICountry, IState } from "@/types/Location.types";
import FormField from "@gratia/ui/components/FormField";
import Input from "@gratia/ui/components/Input";
import InputSearch from "@gratia/ui/components/InputSearch";
import Select from "@gratia/ui/components/Select";
import { useQuery } from "@tanstack/react-query";
import { FieldErrors, UseFormRegister, UseFormWatch } from "react-hook-form";
import styles from "./ShippingForm.module.scss";

interface ShippingFormProps {
  register: UseFormRegister<ShippingAddressFormData>;
  watch: UseFormWatch<ShippingAddressFormData>;
  errors: FieldErrors<ShippingAddressFormData>;
  prefix: "shippingAddress" | "billingAddress";
  title?: string;
}

export default function ShippingForm({
  register,
  errors,
  prefix,
  title,
  watch,
}: ShippingFormProps) {
  const fieldErrors = errors[prefix] as FieldErrors<Address> | undefined;

  const { data: availableCountriesResponse } = useQuery<
    IApiResponse<ICountry[]>
  >({
    queryKey: ["available-countries-for-shipping"],
    queryFn: getAvailableCountriesForShipping,
  });

  const countryOptions =
    availableCountriesResponse?.data?.map((country) => ({
      label: country.name,
      value: country.code,
    })) || [];

  const selectedCountry = watch(`${prefix}.country` as const);
  const isStateDisabled = !selectedCountry;

  const { data: availableStatesResponse, isLoading: isStateLoading } = useQuery<
    IApiResponse<IState[]>
  >({
    queryKey: ["available-states-for-shipping", selectedCountry],
    queryFn: () => getAvailableStatesForShipping(selectedCountry as string),
    enabled: !!selectedCountry && typeof selectedCountry === "string",
  });

  const stateOptions =
    availableStatesResponse?.data?.map((state) => ({
      label: state.name,
      value: state.code,
    })) || [];

  const selectedState = watch(`${prefix}.state` as const);
  const isCityDisabled = !selectedState;

  const { data: availableCitiesResponse, isLoading: isCityLoading } = useQuery<
    IApiResponse<ICity[]>
  >({
    queryKey: ["available-cities-for-shipping", selectedCountry, selectedState],
    queryFn: () =>
      getAvailableCitiesForShipping(
        selectedCountry as string,
        selectedState as string
      ),
    enabled: !!selectedState && typeof selectedState === "string",
  });

  const cityOptions =
    availableCitiesResponse?.data?.map((city) => ({
      label: city.name,
      value: city.code,
    })) || [];

  // Get register handlers
  const countryRegister = register(`${prefix}.country` as const);
  const stateRegister = register(`${prefix}.state` as const);
  const cityRegister = register(`${prefix}.city` as const);

  const selectedCity = watch(`${prefix}.city` as const);

  return (
    <div className={styles.shippingForm}>
      {title && <h2 className={styles.title}>{title}</h2>}

      <div className={styles.formGrid}>
        <div className={styles.formFieldHalf}>
          <FormField
            label="First Name"
            error={fieldErrors?.firstName?.message}
            required
          >
            <Input {...register(`${prefix}.firstName`)} placeholder="John" />
          </FormField>
        </div>

        <div className={styles.formFieldHalf}>
          <FormField
            label="Last Name"
            error={fieldErrors?.lastName?.message}
            required
          >
            <Input {...register(`${prefix}.lastName`)} placeholder="Doe" />
          </FormField>
        </div>

        <div className={styles.formFieldFull}>
          <FormField label="Phone" error={fieldErrors?.phone?.message} required>
            <Input
              type="tel"
              {...register(`${prefix}.phone`)}
              placeholder="+1234567890"
            />
          </FormField>
        </div>

        <div className={styles.formFieldFull}>
          <FormField
            label="Email"
            error={fieldErrors?.email?.message}
            hint="Order confirmation will be sent here"
          >
            <Input
              type="email"
              {...register(`${prefix}.email`)}
              placeholder="your@email.com"
            />
          </FormField>
        </div>

        <div className={styles.formFieldHalf}>
          <FormField
            label="Country"
            error={fieldErrors?.country?.message}
            required
          >
            <Select
              items={countryOptions}
              placeholder="Select a country"
              value={selectedCountry || ""}
              name={countryRegister.name}
              onValueChange={(value) => {
                countryRegister.onChange({
                  target: { name: countryRegister.name, value },
                });
              }}
              onBlur={countryRegister.onBlur}
            />
          </FormField>
        </div>

        <div className={styles.formFieldHalf}>
          <FormField label="State" error={fieldErrors?.state?.message} required>
            <InputSearch
              items={stateOptions}
              placeholder={
                isStateLoading
                  ? "Loading states..."
                  : isStateDisabled
                    ? "Select a country first"
                    : "Search a state"
              }
              value={selectedState || ""}
              name={stateRegister.name}
              onValueChange={(value) => {
                stateRegister.onChange({
                  target: { name: stateRegister.name, value },
                });
              }}
              onBlur={stateRegister.onBlur}
              disabled={isStateDisabled || isStateLoading}
            />
          </FormField>
        </div>

        <div className={styles.formFieldHalf}>
          <FormField label="City" error={fieldErrors?.city?.message} required>
            <InputSearch
              items={cityOptions}
              placeholder={
                isCityLoading
                  ? "Loading cities..."
                  : isCityDisabled
                    ? "Select a state first"
                    : "Search a city"
              }
              value={selectedCity || ""}
              name={cityRegister.name}
              onValueChange={(value) => {
                cityRegister.onChange({
                  target: { name: cityRegister.name, value },
                });
              }}
              onBlur={cityRegister.onBlur}
              disabled={isCityDisabled || isCityLoading}
            />
          </FormField>
        </div>

        <div className={styles.formFieldFull}>
          <FormField
            label="Address Line 1"
            error={fieldErrors?.addressLine1?.message}
            required
          >
            <Input
              {...register(`${prefix}.addressLine1`)}
              placeholder="123 Main Street"
            />
          </FormField>
        </div>

        <div className={styles.formFieldFull}>
          <FormField
            label="Address Line 2 (Optional)"
            hint="Apt, Suite, Unit, etc."
          >
            <Input
              {...register(`${prefix}.addressLine2`)}
              placeholder="Apt 4B"
            />
          </FormField>
        </div>

        <div className={styles.formFieldHalf}>
          <FormField
            label="Postal Code"
            error={fieldErrors?.postalCode?.message}
            required
          >
            <Input {...register(`${prefix}.postalCode`)} placeholder="10001" />
          </FormField>
        </div>
      </div>
    </div>
  );
}
