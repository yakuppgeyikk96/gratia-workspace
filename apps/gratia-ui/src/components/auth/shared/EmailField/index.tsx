"use client";

import { COLORS } from "@/constants/colors";
import FormField from "@gratia/ui/components/FormField";
import Input from "@gratia/ui/components/Input";
import IconAt from "@gratia/ui/icons/IconAt";
import { FieldError, UseFormRegisterReturn } from "react-hook-form";

interface EmailFieldProps {
  register: UseFormRegisterReturn;
  error?: FieldError;
  className?: string;
}

export default function EmailField({
  register,
  error,
  className = "",
}: EmailFieldProps) {
  return (
    <div className={className}>
      <FormField error={error?.message} required name="email">
        <Input
          {...register}
          variant="outlined"
          size="lg"
          startIcon={<IconAt color={COLORS.ICON_MUTED} size={16} />}
          placeholder="Enter your email"
          error={!!error}
        />
      </FormField>
    </div>
  );
}
