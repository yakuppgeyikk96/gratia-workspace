"use client";

import { COLORS } from "@/constants/colors";
import FormField from "@gratia/ui/components/FormField";
import Input from "@gratia/ui/components/Input";
import IconPassword from "@gratia/ui/icons/IconPassword";
import IconVisibility from "@gratia/ui/icons/IconVisibility";
import { FieldError, UseFormRegisterReturn } from "react-hook-form";

interface PasswordFieldProps {
  register: UseFormRegisterReturn;
  error?: FieldError;
  className?: string;
}

export default function PasswordField({
  register,
  error,
  className = "",
}: PasswordFieldProps) {
  return (
    <div className={className}>
      <FormField error={error?.message} required name="password">
        <Input
          {...register}
          variant="outlined"
          size="lg"
          startIcon={<IconPassword color={COLORS.ICON_MUTED} size={16} />}
          endIcon={<IconVisibility color={COLORS.ICON_MUTED} size={16} />}
          placeholder="Enter your password"
          error={!!error}
        />
      </FormField>
    </div>
  );
}
