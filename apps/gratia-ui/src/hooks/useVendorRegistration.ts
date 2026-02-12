"use client";

import { createVendor } from "@/actions/vendor";
import { ICreateVendorRequest, ICreateVendorResponse } from "@/types";
import { useToastContext } from "@gratia/ui/components/Toast";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

const TOAST_DURATION = 3000;

export function useVendorRegistration() {
  const { addToast } = useToastContext();
  const router = useRouter();

  const mutation = useMutation<
    ICreateVendorResponse,
    Error,
    ICreateVendorRequest
  >({
    mutationFn: async (request: ICreateVendorRequest) => {
      const response = await createVendor(request);

      if (!response.success) {
        throw new Error(response.message || "Failed to create vendor account");
      }

      return response;
    },
    onSuccess: (response) => {
      addToast({
        title: "Vendor Account Created",
        description:
          response.message || "Your vendor account has been created successfully.",
        variant: "success",
        duration: TOAST_DURATION,
      });

      router.push("/profile");
    },
    onError: (error) => {
      addToast({
        title: "Registration Failed",
        description:
          error.message || "An error occurred while creating your vendor account.",
        variant: "error",
        duration: TOAST_DURATION,
      });
    },
  });

  const handleCreateVendor = (request: ICreateVendorRequest) => {
    mutation.mutate(request);
  };

  return {
    handleCreateVendor,
    isPending: mutation.isPending,
  };
}
