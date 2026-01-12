import { AppError, ErrorCode } from "../errors/base.errors";

/**
 * Safely extracts a string parameter from req.params
 * Handles the case where Express types allow string | string[] | undefined
 */
export const getStringParam = (
  param: string | string[] | undefined,
  paramName: string = "parameter"
): string => {
  if (!param || Array.isArray(param)) {
    throw new AppError(
      `Invalid ${paramName}: must be a single value`,
      ErrorCode.BAD_REQUEST
    );
  }
  return param;
};

/**
 * Safely extracts and parses an ID parameter from req.params
 */
export const getIdParam = (
  param: string | string[] | undefined,
  paramName: string = "ID"
): number => {
  const stringParam = getStringParam(param, paramName);
  const parsed = parseInt(stringParam, 10);

  if (isNaN(parsed)) {
    throw new AppError(
      `Invalid ${paramName}: must be a number`,
      ErrorCode.BAD_REQUEST
    );
  }

  return parsed;
};